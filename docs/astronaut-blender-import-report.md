# Astronaut Blender Import + Round-Trip QA Report (Gates 5–8)

Executed: 2026-07-12 · Blender **5.1.2** (`C:\Program Files\Blender Foundation\Blender 5.1\blender.exe`, winget install) · Machine-local run.

## Gate 5 — build (background)

Command (from repo root):

```powershell
& $BLENDER --background --factory-startup --python blender/scripts/build_project.py -- `
  --input public/models/astronaut-source.glb `
  --output blender/astronaut-working.blend `
  --manifest config/astronaut-customizer.json
```

Result: **OK** — glTF import 0.02s, 1 mesh, 2 web_ids assigned (`obj.astronaut.body`, `mat.astronaut.body`), collections + `ASTRONAUT_ROOT` + 6 validation cameras + neutral studio lights created, saved `blender/astronaut-working.blend`. Report: `artifacts/astronaut-import-report.json`.

## Gate 5 — validation

`validate_asset.py` → `artifacts/astronaut-import-metrics.json`: **VALIDATION OK**

| Metric | Value |
|---|---|
| objects / meshes | 11 / 1 |
| vertices / triangles | 3,254 / 1,604 |
| materials / armatures / morphs | 1 / 0 / 0 |
| missing textures / empty meshes | none / none |
| duplicate web_ids / unresolved targets | none / none |
| bounding box (m) | 1.12 × 0.72 × 2.01 |

## Gate 6 — production export

`export_web_glb.py` → `public/models/astronaut-production.glb` (**223,344 bytes** in the current artifact vs source 152,912) — 2 objects (root + body mesh), extras (web_id) included, cameras/lights excluded, source GLB untouched (guarded).

## Gates 7–8 — web round-trip QA (dev server, Edge)

| Test | Default (no flag) | `?astroModel=production` | Status |
|---|---|---|---|
| GLB actually fetched (performance entries) | `assets/models/acca-astronaut.glb` | `models/astronaut-production.glb` (no fallback) | ✅ |
| Astronaut renders (hero, 496² buffer) | ✅ | ✅ visually identical | ✅ |
| Saved customization reattaches (patches, hardware, pack, pose) | ✅ | ✅ | ✅ |
| Studio: suit color change (navy) | — | applies instantly via shader uniforms | ✅ |
| Console errors | none | none | ✅ |
| Rollback (flag off / file missing) | — | fallback chain verified earlier (production→source) | ✅ |
| `npm run build` | ✅ green | — | ✅ |

Not exercised in this pass (no visual reason on a no-op round trip): mobile FPS profiling, every single slot permutation — the binding layer (uniforms/groups/poses) is model-independent and was exercised via representative slots.

## Gate 7 — GUI

`python blender/scripts/open_project.py` → background sanity check OK (11 objects) → GUI launched:

```
"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" C:\Users\USER\acca-edu\blender\astronaut-working.blend
```

## Verdict

**READY** — the pipeline round-trips the astronaut with no loss and no default-traffic impact. Artist edits can now happen in `blender/astronaut-working.blend`; after each edit run the export command and preview behind `?astroModel=production`. Constraints for artists: `docs/astronaut-roundtrip-limitations.md`.
