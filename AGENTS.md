# Agent Notes — acca-edu

React 19 + Vite 8 SPA (Persian-first RTL, English toggle) deployed on Vercel. Never commit or push to `main` directly: pull → feature branch → PR.

## Hero astronaut (brand character)

The landing-page astronaut is a brand asset. Source of truth and pipeline:

- Runtime: [src/components/sections/buildAstronaut.js](src/components/sections/buildAstronaut.js) loads the GLB, patches the material (`onBeforeCompile` recolor uniforms), synthesizes a skinned rig ([astronautRig.js](src/components/sections/astronautRig.js)) and anchors procedural gear ([astronautHardware.js](src/components/sections/astronautHardware.js)).
- Customizer: [AstronautCustomizerModal.jsx](src/components/sections/AstronautCustomizerModal.jsx) + config ids in [src/lib/astronautConfig.js](src/lib/astronautConfig.js). Bindings are shader uniforms / hardware group ids / pose ids — **never child index or traversal order**.
- Stable IDs: `userData.web_id` per [config/astronaut-customizer.json](config/astronaut-customizer.json).

### Blender round-trip

- Source GLB: `public/models/astronaut-source.glb` (copy of `public/assets/models/acca-astronaut.glb`) — **never overwrite**.
- Automation: `blender/scripts/` + `tools/find_blender.py`; commands in [blender/README.md](blender/README.md).
- Production model: `public/models/astronaut-production.glb`, loaded only behind the flag `?astroModel=production` (or localStorage `acca-astronaut-model`), fallback chain production → source → remote.
- Read before editing the model or masks: [docs/astronaut-roundtrip-limitations.md](docs/astronaut-roundtrip-limitations.md), [docs/astronaut-source-audit.md](docs/astronaut-source-audit.md).

## Verification

Dev server: launch config `dev` (port 5173, HMR). Always verify astronaut changes visually — rotate the model (drag), test poses (Studio → حرکت tab) and check multiple angles before claiming success.
