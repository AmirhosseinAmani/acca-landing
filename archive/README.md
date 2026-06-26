# Archive — legacy Istanbul map

This folder preserves superseded code that is intentionally **not** built or
imported by the app. Kept for reference only.

## `IstanbulUniversityMapPage.legacy-pre-mapbox.jsx`

The Istanbul university map **as it was before the Mapbox GL migration** — the
stylised low-poly Three.js scene (green hills, simple volumes) plus the old
MapLibre raster setup. This is the "old map" you used to see on the live site.

It was captured from git commit `56097b8` (the commit immediately before
`c5fbb2b "Istanbul map: migrate engine MapLibre -> Mapbox GL JS v3"`).

### Note
The live map (`src/components/pages/IstanbulUniversityMapPage.jsx`) is now the
cinematic **Mapbox** map with typed 3D building archetypes. The same low-poly
scene still ships **inside** the live component as the automatic fallback used
when WebGL or the Mapbox token is unavailable — so the old look is never lost,
it just no longer shows when the real map can render.
