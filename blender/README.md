# Astronaut Blender Pipeline

Round-trip: `Three.js website → astronaut-source.glb → Blender → astronaut-production.glb → Three.js website`.

Only the **model** crosses the bridge. UI, customizer, shader recolor, runtime rig, hardware add-ons and interaction stay in the web (see `docs/astronaut-source-audit.md`).

## Prerequisites

- Blender 4.x installed locally. Quick install on Windows:
  ```powershell
  winget install --id BlenderFoundation.Blender
  ```
- Optional: set `BLENDER_BIN` to the full executable path. Resolution is handled by `tools/find_blender.py` (BLENDER_BIN → PATH → standard install dirs).

## Commands (run from the repo root)

Resolve Blender:

```powershell
python tools/find_blender.py
```

Build the working project (background, safe to re-run — back up your .blend first if you have manual edits):

```powershell
$BLENDER = python tools/find_blender.py
& $BLENDER --background --factory-startup `
  --python blender/scripts/build_project.py -- `
  --input public/models/astronaut-source.glb `
  --output blender/astronaut-working.blend `
  --manifest config/astronaut-customizer.json
```

Validate:

```powershell
& $BLENDER blender/astronaut-working.blend --background `
  --python blender/scripts/validate_asset.py -- `
  --output artifacts/astronaut-import-metrics.json `
  --manifest config/astronaut-customizer.json
```

Open the GUI for artist work (checks the file in background first):

```powershell
python blender/scripts/open_project.py
```

Export the production GLB (never touches the source GLB):

```powershell
& $BLENDER blender/astronaut-working.blend --background `
  --python blender/scripts/export_web_glb.py -- `
  --output public/models/astronaut-production.glb
```

Preview in the site: open `http://localhost:5173/?astroModel=production` (or set `localStorage['acca-astronaut-model'] = 'production'`). Fallback chain production → source → remote; default traffic is untouched until QA passes.

## Rules for artists

- Edit inside `ASTRONAUT_MODEL` under `ASTRONAUT_ROOT`; keep the root name.
- Never delete/rename the `web_id` custom properties on the body mesh/material.
- Keep overall scale (~1 unit ≈ 1 m; web normalizes to its own scale but the runtime rig assumes the current proportions — large limb repositioning shifts the heuristic skinning zones; see `docs/astronaut-roundtrip-limitations.md`).
- Validation cameras (`CAM_*`) and lights (`LIGHT_*`) are never exported.
- Reference images: `reference/astronaut/*.png` (six canonical views).
