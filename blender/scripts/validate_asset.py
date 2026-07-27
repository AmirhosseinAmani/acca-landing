"""Validate the astronaut Blender project and emit JSON metrics.

  blender blender/astronaut-working.blend --background \
    --python blender/scripts/validate_asset.py -- \
    --output artifacts/astronaut-import-metrics.json \
    --manifest config/astronaut-customizer.json
"""

import argparse
import json
import os
import sys

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", default=None)
    return parser.parse_args(argv)


def main():
    args = parse_args()
    id_property = "web_id"
    manifest = None
    if args.manifest and os.path.isfile(args.manifest):
        with open(args.manifest, "r", encoding="utf-8") as handle:
            manifest = json.load(handle)
        id_property = manifest.get("idProperty", "web_id")

    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    vertex_count = sum(len(obj.data.vertices) for obj in meshes)
    triangle_count = 0
    empty_meshes = []
    for obj in meshes:
        obj.data.calc_loop_triangles()
        triangle_count += len(obj.data.loop_triangles)
        if len(obj.data.vertices) == 0:
            empty_meshes.append(obj.name)

    missing_textures = [
        image.name
        for image in bpy.data.images
        if image.source == "FILE" and image.filepath and not image.packed_file
        and not os.path.isfile(bpy.path.abspath(image.filepath))
    ]

    seen, duplicates = {}, []
    for datablocks in (bpy.data.objects, bpy.data.materials):
        for block in datablocks:
            value = block.get(id_property)
            if value:
                if value in seen:
                    duplicates.append(value)
                seen[value] = block.name

    unresolved_targets = []
    if manifest:
        expected = list(manifest.get("glbBindings", {}).get("objects", {}))
        expected += list(manifest.get("glbBindings", {}).get("materials", {}))
        unresolved_targets = [web_id for web_id in expected if web_id not in seen]

    root = bpy.data.objects.get("ASTRONAUT_ROOT")
    non_uniform_root = bool(root) and len(set(round(component, 6) for component in root.scale)) > 1
    zero_scale = [
        obj.name for obj in bpy.data.objects
        if any(abs(component) < 1e-9 for component in obj.scale)
    ]

    lowest = Vector((float("inf"),) * 3)
    highest = Vector((float("-inf"),) * 3)
    for obj in meshes:
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            lowest = Vector(map(min, lowest, world))
            highest = Vector(map(max, highest, world))
    dimensions = [round(component, 4) for component in (highest - lowest)] if meshes else [0, 0, 0]

    metrics = {
        "blend_file": bpy.data.filepath,
        "object_count": len(bpy.data.objects),
        "mesh_count": len(meshes),
        "vertex_count": vertex_count,
        "triangle_count": triangle_count,
        "material_count": len(bpy.data.materials),
        "armature_count": len([obj for obj in bpy.data.objects if obj.type == "ARMATURE"]),
        "animation_names": [action.name for action in bpy.data.actions],
        "morph_target_count": sum(
            len(obj.data.shape_keys.key_blocks) - 1
            for obj in meshes
            if obj.data.shape_keys
        ),
        "images": [image.name for image in bpy.data.images],
        "missing_texture_paths": missing_textures,
        "web_ids": seen,
        "duplicate_web_ids": duplicates,
        "unresolved_customizer_targets": unresolved_targets,
        "non_uniform_root_scale": non_uniform_root,
        "zero_scale_objects": zero_scale,
        "empty_meshes": empty_meshes,
        "bounding_box_dimensions": dimensions,
    }

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2, ensure_ascii=False)

    problems = duplicates or unresolved_targets or missing_textures or empty_meshes
    print(json.dumps({k: metrics[k] for k in (
        "mesh_count", "triangle_count", "material_count",
        "duplicate_web_ids", "unresolved_customizer_targets",
        "missing_texture_paths",
    )}, ensure_ascii=False))
    if problems:
        raise SystemExit("VALIDATION FAILED — see " + args.output)
    print("VALIDATION OK — " + args.output)


if __name__ == "__main__":
    main()
