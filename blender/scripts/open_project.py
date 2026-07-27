#!/usr/bin/env python3
"""Open the astronaut Blender project safely (regular Python, not bpy).

  python tools\\..\\blender\\scripts\\open_project.py [--check-only]

1. Resolves Blender (BLENDER_BIN → PATH → standard locations).
2. Confirms blender/astronaut-working.blend exists.
3. Sanity-opens it in background mode first.
4. Launches the GUI (skipped with --check-only) and prints the exact command.
Never claims the GUI opened when it could not.
"""

import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(REPO, "tools"))

from find_blender import find_blender  # noqa: E402

BLEND_FILE = os.path.join(REPO, "blender", "astronaut-working.blend")


def main():
    blender = find_blender()
    if not blender:
        sys.stderr.write("Blender not found — see tools/find_blender.py guidance.\n")
        return 1
    print(f"Blender: {blender}")

    if not os.path.isfile(BLEND_FILE):
        sys.stderr.write(
            f"Missing {BLEND_FILE}\nRun the build first:\n"
            f'  "{blender}" --background --factory-startup '
            f"--python blender/scripts/build_project.py -- "
            f"--input public/models/astronaut-source.glb "
            f"--output blender/astronaut-working.blend "
            f"--manifest config/astronaut-customizer.json\n"
        )
        return 1

    check = subprocess.run(
        [blender, BLEND_FILE, "--background",
         "--python-expr", "import bpy; print('OBJECTS', len(bpy.data.objects))"],
        capture_output=True, text=True, timeout=180,
    )
    if check.returncode != 0 or "OBJECTS" not in check.stdout:
        sys.stderr.write("Background sanity check FAILED:\n" + check.stdout + check.stderr)
        return 1
    print("Background sanity check OK:", [line for line in check.stdout.splitlines() if "OBJECTS" in line][0])

    command = [blender, BLEND_FILE]
    print("GUI launch command:", subprocess.list2cmdline(command))
    if "--check-only" in sys.argv:
        print("(--check-only: GUI not launched)")
        return 0
    subprocess.Popen(command, cwd=REPO)
    print("Blender GUI launched.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
