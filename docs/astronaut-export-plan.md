# Astronaut Export Plan (Gate 2)

Based on `docs/astronaut-source-audit.md`.

## Selected strategy: A — use the existing source GLB directly

An authoritative GLB already exists (`public/assets/models/acca-astronaut.glb`). It was **copied, not moved**, to `public/models/astronaut-source.glb` for the pipeline; the site keeps loading its original path untouched.

## Why not the other strategies

- **B (assemble at runtime, then export):** the runtime layers (rig, hardware, shader recolor) are *intentionally* web-side — they rebind to whatever body mesh loads. Exporting them would freeze customization into geometry and lose the customizer.
- **C (runtime GLTFExporter):** unnecessary when a source GLB exists, and it would serialize the synthesized skeleton + procedural gear (worst of both worlds). Explicitly rejected per the pipeline doctrine ("do not runtime-export an existing source GLB unnecessarily").
- **D (bake first):** nothing needs pre-baking — the GLB's material is a plain baked-basecolor PBR. The `onBeforeCompile` recolor is a *web feature we keep*, not something to reproduce in Blender.

## What crosses the bridge vs. what stays in the web

| Goes to Blender | Stays in Three.js |
|---|---|
| body mesh, UVs, baked basecolor texture, hierarchy/transforms | React UI, Astronaut Studio modal, config/state (`astronautConfig.js`) |
| (optional, artist work) a real armature/skinning to replace the heuristic web rig | shader recolor uniforms, procedural hardware, patches, tools, poses, undersuit fillers |
| geometry improvements: seams, panel welds, better joints, added detail meshes | env map, lighting, post, pointer/scroll interaction |

## Files created / modified

- `public/models/astronaut-source.glb` — pipeline source (copy).
- `config/astronaut-customizer.json` — stable-ID manifest (Gate 3).
- `src/components/sections/buildAstronaut.js` — stamps `userData.web_id` on the body mesh/material; loads `astronaut-production.glb` behind a feature flag with automatic fallback (Gate 7).
- `blender/scripts/*`, `tools/find_blender.py`, `blender/README.md` — automation (Gate 4).
- `reference/astronaut/*.png` — the multi-view reference pack for in-Blender image references.

## Rollback plan

The production model loads **only** behind the flag (`?astroModel=production` or `localStorage acca-astronaut-model = "production"`). Default path and file are untouched; removing the flag (or the file being absent → automatic fallback chain production → source → remote) restores the current behavior instantly. `astronaut-source.glb` is never overwritten by any script (hard-guarded in `export_web_glb.py`).

## Expected information loss

- None on the copy step (byte-identical).
- On Blender re-export: `onBeforeCompile` behavior is not representable in glTF — *by design it never leaves the web*. The recolor masks are position/luminance based, so **large geometry repositioning or texture-luminance changes in Blender can shift recolor regions**; documented in `docs/astronaut-roundtrip-limitations.md`.

## Customizer preservation plan

The customizer binds to shader uniforms + hardware group ids + pose ids (never names/indexes), so it survives any body-mesh swap that keeps approximate scale/orientation. The manifest adds `web_id`s to the mesh/material as forward-looking stable anchors (and Blender scripts stamp the same ids as custom properties → glTF extras).

## Validation steps (executed at Gates 5–8)

1. `blender --background --factory-startup --python blender/scripts/build_project.py -- --input public/models/astronaut-source.glb --output blender/astronaut-working.blend --manifest config/astronaut-customizer.json`
2. `blender blender/astronaut-working.blend --background --python blender/scripts/validate_asset.py -- --output artifacts/astronaut-import-metrics.json --manifest config/astronaut-customizer.json`
3. `blender blender/astronaut-working.blend --background --python blender/scripts/export_web_glb.py -- --output public/models/astronaut-production.glb`
4. Load site with `?astroModel=production`, run the Studio through every slot, compare against the six reference views, check console + FPS.

**Status: executed and verified.** Blender 5.1.2 completed the build, validation and production export. The web round-trip and rollback path were then checked in Edge; see `docs/astronaut-blender-import-report.md`.
