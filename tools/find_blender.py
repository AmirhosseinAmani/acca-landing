#!/usr/bin/env python3
"""Locate the Blender executable across platforms.

Resolution order:
  1. BLENDER_BIN environment variable
  2. `blender` on PATH
  3. Standard install locations (Windows / macOS / Linux, incl. Steam)

Prints the resolved absolute path on success (exit 0).
Exits 1 with actionable guidance when Blender cannot be found.
"""

import glob
import os
import shutil
import sys


def candidates():
    env = os.environ.get("BLENDER_BIN")
    if env:
        yield env

    on_path = shutil.which("blender")
    if on_path:
        yield on_path

    if sys.platform.startswith("win"):
        for base in (r"C:\Program Files\Blender Foundation", r"C:\Program Files (x86)\Blender Foundation"):
            for exe in sorted(glob.glob(os.path.join(base, "Blender*", "blender.exe")), reverse=True):
                yield exe
        yield r"C:\Program Files (x86)\Steam\steamapps\common\Blender\blender.exe"
    elif sys.platform == "darwin":
        yield "/Applications/Blender.app/Contents/MacOS/Blender"
        for exe in sorted(glob.glob("/Applications/Blender*/Blender.app/Contents/MacOS/Blender"), reverse=True):
            yield exe
    else:
        yield "/usr/bin/blender"
        yield "/usr/local/bin/blender"
        yield "/snap/bin/blender"
        for exe in sorted(glob.glob(os.path.expanduser("~/blender*/blender")), reverse=True):
            yield exe


def find_blender():
    for candidate in candidates():
        if candidate and os.path.isfile(candidate) and os.access(candidate, os.X_OK):
            return os.path.abspath(candidate)
    return None


if __name__ == "__main__":
    resolved = find_blender()
    if resolved:
        print(resolved)
        sys.exit(0)
    sys.stderr.write(
        "Blender was not found.\n"
        "Fix one of the following and retry:\n"
        "  1. Install Blender (Windows: winget install --id BlenderFoundation.Blender)\n"
        "  2. Set BLENDER_BIN to the full path of the blender executable\n"
        "  3. Add the Blender install directory to PATH\n"
    )
    sys.exit(1)
