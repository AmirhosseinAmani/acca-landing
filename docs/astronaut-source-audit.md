# Astronaut Source Audit (Gate 1)

Audited: 2026-07-12 · Auditor: Claude (pipeline agent) · Scope: hero astronaut only.

## 1–3. Stack

| Question | Answer |
|---|---|
| Framework / build | React 19 SPA, Vite 8, Tailwind v4, deployed on Vercel (`npm run build` → `dist/`, build-time prerender step) |
| Three.js version | `three@^0.184.0` (plain Three.js) |
| React Three Fiber | **Not used** — imperative Three.js inside `useEffect` |

## 4. Where the astronaut root is created

- Entry component: [HeroAstronautScene.jsx](../src/components/sections/HeroAstronautScene.jsx) — owns renderer/scene/camera, calls `buildAstronaut()` and adds `astronaut.group` to the scene. Also used by the customizer's preview canvas in [AstronautCustomizerModal.jsx](../src/components/sections/AstronautCustomizerModal.jsx).
- Builder: [buildAstronaut.js](../src/components/sections/buildAstronaut.js) — `buildAstronaut(config, { envTexture })` returns `{ group, applyConfig, update, dispose }`.
- Mounted from [HeroSection.jsx](../src/components/sections/HeroSection.jsx) (desktop + mobile, webp as Suspense fallback).

## 5. Source classification

**D — hybrid.** An authoritative GLB exists, but the on-screen astronaut is the GLB **plus three runtime layers**:

1. **Runtime skeleton** — the GLB has *no armature*. [astronautRig.js](../src/components/sections/astronautRig.js) builds `THREE.Bone`s (root, shoulders, elbows, hands, hips, knees), computes `skinIndex`/`skinWeight` attributes heuristically per connected mesh component, and creates a `SkinnedMesh`. Poses (`float/reference/drift/sit/walk/jet`) are joint-rotation presets evaluated per frame. It also provides sleeve-patch anchors.
2. **Shader-patched material** — `createSuitMaterial()` in buildAstronaut.js: a `MeshPhysicalMaterial` with `onBeforeCompile` region masks (position + luminance driven) and uniforms `suit/accent/visor/packPrimary/packSecondary/suitStrength/visorStrength` that recolor suit cloth, accents, visor, PLSS and dark trims at runtime.
3. **Procedural hardware** — [astronautHardware.js](../src/components/sections/astronautHardware.js): helmet add-ons (5), chest modules (6), pack add-ons (6, including jetpack flames and detailed PLSS controls), plus sleeve/chest patch planes using generated CanvasTexture badges.

## 6. Assets involved

| Asset | Path | Notes |
|---|---|---|
| Astronaut GLB | `public/assets/models/acca-astronaut.glb` (149 KB) | authoritative mesh + baked basecolor texture; attribution in `ATTRIBUTION.md` |
| Remote fallback GLB | `https://modelviewer.dev/shared-assets/models/Astronaut.glb` | only if local file fails to load |
| Environment | procedural `CanvasTexture` (equirect) generated per theme in HeroAstronautScene | runtime-only |
| Patch textures | `CanvasTexture` drawn at runtime (flags plus ACCA, orbit, lunar, Earth, science and Mars badges) | runtime-only |
| Animations | none in GLB; all motion is runtime joint math | |

## 7–10. Customizer bindings

Config schema: [astronautConfig.js](../src/lib/astronautConfig.js) (`acca-astronaut-v8` in localStorage). The customizer **never binds to mesh names, child indexes or traversal order**:

| Slot group | Mechanism |
|---|---|
| `suit`, `accent`, `visor`, `packPrimary`, `packSecondary` | shader **uniforms** on the single body material (+ mirrored onto hardware materials in `hardware.setConfig`) |
| `helmet`, `pack`, `chest`, `logo` | visibility toggle or texture update of named procedural **hardware groups** keyed by option id |
| `pose` | rig pose id evaluated by `updateAstronautRig` |

- Click selection / Raycaster: **none** — customization happens via the modal UI, not by clicking parts.
- State: React state in HeroSection + localStorage; sanitize/migration logic in astronautConfig.js.

## 11. Runtime-only visual features (cannot survive a naive glTF round-trip)

- `onBeforeCompile` recolor masks and uniforms (glTF has no equivalent; must stay in web or be re-derived after reload).
- Runtime-generated skeleton + skin weights (a Blender re-rig would *replace* this, which is desirable long-term but web code currently rebuilds it on load).
- Procedural hardware meshes, CanvasTexture patches, emissive pulsing, jet flames (additive material), env-map reflections.

## 12. Compression

No DRACO, no Meshopt, no KTX2 anywhere in `src/`. Plain `GLTFLoader`.

## 13. Existing Blender pipeline

The repository includes the repeatable pipeline under `blender/scripts/`, its stable-ID manifest in `config/astronaut-customizer.json`, and the immutable source GLB at `public/models/astronaut-source.glb`. Working `.blend` files remain local generated artifacts and are intentionally ignored.

## 14. GLB contents (as loaded)

Single mesh + single material + baked basecolor map. No armature, no morph targets, no animation clips (`firstMesh()` grabs the only mesh; rig is synthesized).

## 15. Material compatibility table

| Web material | glTF-safe? | Strategy |
|---|---|---|
| Body `MeshPhysicalMaterial` + onBeforeCompile | base is safe; shader patch is NOT | export base PBR + baked basecolor; recolor logic stays in web and re-applies on load |
| Hardware Standard/Physical materials | safe | stay runtime (web-only layer) |
| Flame `MeshBasicMaterial` (additive) | additive blending not in glTF | stays runtime |
| Patch `CanvasTexture` planes | texture is runtime-generated | stays runtime |

## Asset dependency map

```
HeroSection ─▶ HeroAstronautScene ─▶ buildAstronaut ─▶ GLTFLoader(acca-astronaut.glb)
                                          ├─▶ createSuitMaterial (onBeforeCompile + uniforms)
                                          ├─▶ createAstronautRig (bones + skin weights + fillers + anchors)
                                          └─▶ createAstronautHardware (helmet/chest/pack/tools/patches/umbilicals)
AstronautCustomizerModal ─▶ (same buildAstronaut for its preview) + astronautConfig (ids)
```

## Recommendation

- **Authoritative source asset:** `public/assets/models/acca-astronaut.glb` → copied to `public/models/astronaut-source.glb` for the pipeline.
- **Safest round-trip:** Strategy **A** (import the existing source GLB into Blender directly). Never runtime-export the assembled scene: the rig, hardware and shader layers are web-side by design and reattach to *any* body mesh that preserves overall shape/scale. See `docs/astronaut-export-plan.md`.
