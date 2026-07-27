"""Export the production GLB for the website.

  blender blender/astronaut-working.blend --background \
    --python blender/scripts/export_web_glb.py -- \
    --output public/models/astronaut-production.glb

Exports ONLY ASTRONAUT_ROOT and its descendants. Never overwrites
astronaut-source.glb. Validation cameras/lights/references stay behind.
"""

import argparse
import json
import os
import sys

import bpy


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--report", default="artifacts/astronaut-export-report.json")
    return parser.parse_args(argv)


def main():
    args = parse_args()
    output = os.path.abspath(args.output)
    if os.path.basename(output) == "astronaut-source.glb":
        raise SystemExit("REFUSED: never overwrite astronaut-source.glb")

    root = bpy.data.objects.get("ASTRONAUT_ROOT")
    if root is None:
        raise SystemExit("ABORT: ASTRONAUT_ROOT not found in this blend file")

    def descendants(obj):
        yield obj
        for child in obj.children:
            yield from descendants(child)

    export_set = {obj.name for obj in descendants(root)}

    bpy.ops.object.select_all(action="DESELECT")
    selected = []
    for obj in bpy.data.objects:
        keep = obj.name in export_set and obj.type not in {"CAMERA", "LIGHT"}
        obj.select_set(keep)
        if keep:
            selected.append(obj.name)
    if not any(bpy.data.objects[name].type == "MESH" for name in selected):
        raise SystemExit("ABORT: nothing meshy selected under ASTRONAUT_ROOT")

    os.makedirs(os.path.dirname(output), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=output,
        export_format="GLB",
        use_selection=True,
        export_animations=True,
        export_skins=True,
        export_morph=True,
        export_extras=True,      # custom properties (web_id) → glTF extras
        export_cameras=False,
        export_lights=False,
        export_yup=True,
    )

    report = {
        "output": output,
        "size_bytes": os.path.getsize(output),
        "exported_objects": sorted(selected),
        "animations": [action.name for action in bpy.data.actions],
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.report)), exist_ok=True)
    with open(args.report, "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2, ensure_ascii=False)
    print(f"OK: exported {output} ({report['size_bytes']} bytes, {len(selected)} objects)")


if __name__ == "__main__":
    main()
