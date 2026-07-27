# Astronaut Round-Trip Limitations (honest report)

What survives the `Three.js → Blender → Three.js` round-trip, what does not, and why.

## Fully survives

- Mesh geometry, hierarchy, transforms, UVs, vertex colors
- Baked basecolor texture (embedded in the GLB)
- `web_id` custom properties (exported as glTF `extras`, read back into `userData`)
- Any armature/skinning/shape keys/animations an artist adds in Blender (glTF-native)

## Web-only by design (never enters Blender, reattaches on load)

- **Shader recolor** — the `onBeforeCompile` region masks + uniforms (suit/accent/visor/packPrimary/packSecondary). glTF cannot express this; the web rebuilds it on whatever mesh loads.
- **Runtime rig & poses** — bones/skin-weights are synthesized in `astronautRig.js`; poses are joint-rotation presets. If Blender ships a real armature later, the web loader should switch to it (future work — currently the synthetic rig always replaces/overlays).
- **Procedural hardware** — helmet add-ons, chest modules, packs, jet flames (additive blending — not in glTF), patch CanvasTextures, hand tools, umbilical connectors.
- Environment reflections, emissive pulsing, selection glow, all UI.

## Fragile couplings — respect these in Blender

1. **Recolor masks are position + luminance based.** They assume the body occupies roughly the current local-space envelope (visor ≈ y 1.5–1.64 local, PLSS behind z < −0.015, chest front z > 0.2 …) and that cloth is light, trims are dark in the baked texture. Repainting the texture's luminance structure or drastically moving regions shifts what gets recolored. Small sculpting/detailing is safe; a full repaint needs shader-mask review in `createSuitMaterial()`.
2. **Heuristic skinning zones.** `astronautRig.js` classifies vertices by normalized position (shoulders at ±0.193 × width, hips at ±0.105 …). Keeping humanoid proportions keeps poses working; radical proportion changes need the rig constants re-tuned (or a real Blender armature — preferred long-term).
3. **Hardware anchor coordinates** in `astronautHardware.js` are tuned to the current silhouette (helmet at y ≈ 0.755, chest at z ≈ 0.3, pack at z ≈ −0.37 in normalized space). Same rule: refine, don't relocate, or re-tune the anchors afterwards.
4. **Scale/orientation.** Export Y-up GLB (script does this). The web normalizes size, but keep the model roughly current-sized so hardware/rig constants stay valid.

## Not usable

- Blender procedural material nodes beyond Principled BSDF → must be baked to textures before export (script exports whatever is baked/assigned; it will not invent bakes).
- Blender-only features: geometry nodes live modifiers (apply before export), physics, particles.

## Verdict per Master Prompt Gate 8

**READY with the constraints above.** Blender and the production GLB are present, and the flagged production-model round trip has passed representative web QA. See `docs/astronaut-blender-import-report.md` for the executed checks.
