"""Build the astronaut Blender working project from the source GLB.

Runs INSIDE Blender:

  blender --background --factory-startup \
    --python blender/scripts/build_project.py -- \
    --input public/models/astronaut-source.glb \
    --output blender/astronaut-working.blend \
    --manifest config/astronaut-customizer.json

Creates a clean, organized, editable project. It must NOT redesign, remesh,
decimate or otherwise alter the imported astronaut geometry.
"""

import argparse
import json
import math
import os
import sys

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--report", default="artifacts/astronaut-import-report.json")
    return parser.parse_args(argv)


def ensure_collection(name, parent=None):
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(collection)
    return collection


def move_to_collection(obj, collection):
    for existing in list(obj.users_collection):
        existing.objects.unlink(obj)
    collection.objects.link(obj)


def look_at(camera, target):
    direction = target - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def scene_bounds(objects):
    lowest = Vector((math.inf,) * 3)
    highest = Vector((-math.inf,) * 3)
    for obj in objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            lowest = Vector(map(min, lowest, world))
            highest = Vector(map(max, highest, world))
    if lowest.x is math.inf:
        lowest = Vector((0, 0, 0))
        highest = Vector((1, 1, 1))
    return lowest, highest


def main():
    args = parse_args()
    report = {"input": args.input, "warnings": [], "errors": []}

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0

    if not os.path.isfile(args.input):
        raise SystemExit(f"Input GLB not found: {args.input}")
    with open(args.manifest, "r", encoding="utf-8") as handle:
        manifest = json.load(handle)

    # ---- Collections ------------------------------------------------------
    model_col = ensure_collection("ASTRONAUT_MODEL")
    ensure_collection("REFERENCES")
    lighting_col = ensure_collection("LIGHTING")
    cameras_col = ensure_collection("CAMERAS")
    ensure_collection("EXPORT")

    # ---- Import -----------------------------------------------------------
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(args.input))
    imported = [obj for obj in bpy.data.objects if obj not in before]
    meshes = [obj for obj in imported if obj.type == "MESH"]
    if not meshes:
        report["errors"].append("No mesh was imported from the source GLB.")
        write_report(args.report, report)
        raise SystemExit("ABORT: no mesh imported")

    for obj in imported:
        move_to_collection(obj, model_col)

    # ---- Root -------------------------------------------------------------
    root = bpy.data.objects.get("ASTRONAUT_ROOT")
    if root is None:
        root = bpy.data.objects.new("ASTRONAUT_ROOT", None)
        model_col.objects.link(root)
    for obj in imported:
        if obj.parent is None and obj is not root:
            obj.parent = root

    # ---- Stable web ids ----------------------------------------------------
    id_property = manifest.get("idProperty", "web_id")
    bindings = manifest.get("glbBindings", {})
    assigned, unresolved = [], []

    for web_id, spec in bindings.get("objects", {}).items():
        target = None
        if spec.get("match") == "firstMesh":
            target = meshes[0]
        if target is None:
            for name in spec.get("legacyNames", []):
                target = bpy.data.objects.get(name)
                if target:
                    break
        if target is None:
            unresolved.append(web_id)
        else:
            target[id_property] = web_id
            assigned.append({"web_id": web_id, "object": target.name})

    all_materials = [
        slot.material
        for mesh in meshes
        for slot in mesh.material_slots
        if slot.material
    ]
    for web_id, spec in bindings.get("materials", {}).items():
        target = None
        if spec.get("match") == "firstMaterial" and all_materials:
            target = all_materials[0]
        if target is None:
            for name in spec.get("legacyNames", []):
                target = bpy.data.materials.get(name)
                if target:
                    break
        if target is None:
            unresolved.append(web_id)
        else:
            target[id_property] = web_id
            assigned.append({"web_id": web_id, "material": target.name})

    seen, duplicates = set(), set()
    for datablocks in (bpy.data.objects, bpy.data.materials):
        for block in datablocks:
            value = block.get(id_property)
            if value:
                if value in seen:
                    duplicates.add(value)
                seen.add(value)

    # ---- Validation cameras -------------------------------------------------
    lowest, highest = scene_bounds(meshes)
    center = (lowest + highest) / 2
    size = max(highest - lowest)
    distance = size * 2.4
    views = {
        "CAM_front": (0, -distance, 0),
        "CAM_back": (0, distance, 0),
        "CAM_left": (-distance, 0, 0),
        "CAM_right": (distance, 0, 0),
        "CAM_front_three_quarter": (-distance * 0.72, -distance * 0.72, distance * 0.28),
        "CAM_back_three_quarter": (distance * 0.72, distance * 0.72, distance * 0.28),
    }
    for name, offset in views.items():
        data = bpy.data.cameras.new(name)
        cam = bpy.data.objects.new(name, data)
        cameras_col.objects.link(cam)
        cam.location = center + Vector(offset)
        look_at(cam, center)
    scene.camera = bpy.data.objects["CAM_front"]

    # ---- Neutral studio lighting --------------------------------------------
    rigs = [
        ("KEY", (distance, -distance, distance), 900),
        ("FILL", (-distance, -distance * 0.6, distance * 0.4), 350),
        ("RIM", (0, distance, distance * 0.8), 550),
    ]
    for name, location, energy in rigs:
        data = bpy.data.lights.new(f"LIGHT_{name}", type="AREA")
        data.energy = energy
        data.size = size
        light = bpy.data.objects.new(f"LIGHT_{name}", data)
        lighting_col.objects.link(light)
        light.location = center + Vector(location)
        look_at(light, center)

    # ---- Save + report -------------------------------------------------------
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.output))

    report.update({
        "output": args.output,
        "imported_objects": [obj.name for obj in imported],
        "mesh_count": len(meshes),
        "material_count": len(set(all_materials)),
        "armature_count": len([o for o in imported if o.type == "ARMATURE"]),
        "animation_clips": [action.name for action in bpy.data.actions],
        "web_ids_assigned": assigned,
        "web_ids_unresolved": unresolved,
        "web_ids_duplicated": sorted(duplicates),
    })
    if unresolved:
        report["errors"].append(f"Unresolved manifest ids: {unresolved}")
    if duplicates:
        report["errors"].append(f"Duplicate web ids: {sorted(duplicates)}")
    write_report(args.report, report)

    if report["errors"]:
        raise SystemExit("ABORT: " + "; ".join(report["errors"]))
    print(f"OK: saved {args.output} — {len(meshes)} mesh(es), ids {len(assigned)} assigned")


def write_report(path, report):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
