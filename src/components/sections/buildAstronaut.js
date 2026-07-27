import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createAstronautRig, updateAstronautRig } from './astronautRig';
import { createAstronautHardware } from './astronautHardware';
import {
  ACCENT_FINISHES,
  BODY_MATERIAL_TARGET_IDS,
  EDITOR_MATERIALS,
  SUIT_FINISHES,
  getAstronautEditorTargetState,
  resolveAstronautColors,
  sanitizeAstronautConfig,
} from '../../lib/astronautConfig';

export const ASTRONAUT_MODEL_URL = '/assets/models/acca-astronaut.glb';
export const ASTRONAUT_PRODUCTION_MODEL_URL = '/models/astronaut-production.glb';
const FALLBACK_MODEL_URL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
const EDITOR_MATERIAL_BY_ID = new Map(EDITOR_MATERIALS.map((material) => [material.id, material]));
const SUIT_FINISH_BY_ID = new Map(SUIT_FINISHES.map((finish) => [finish.id, finish]));
const ACCENT_FINISH_BY_ID = new Map(ACCENT_FINISHES.map((finish) => [finish.id, finish]));
const BODY_MATERIAL_PART_INDEX_BY_TARGET = new Map(
  BODY_MATERIAL_TARGET_IDS.map((targetId, index) => [targetId, index + 1])
);
const PACK_SHELL_MATERIAL_PART_INDEX =
  BODY_MATERIAL_PART_INDEX_BY_TARGET.get('body.pack.shell') ?? -1;
const HOSE_MATERIAL_PART_INDICES = [
  'body.hose.right.upper',
  'body.hose.right.lower',
  'body.hose.left.upper',
  'body.hose.left.lower',
].map((targetId) => BODY_MATERIAL_PART_INDEX_BY_TARGET.get(targetId) ?? -1);
const EXPLICIT_HOSE_MASK_GLSL = HOSE_MATERIAL_PART_INDICES.reduce(
  (expression, partIndex) => (
    `max(${expression}, 1.0 - smoothstep(0.05, 0.25, abs(vAstronautEditorPartId - ${partIndex}.0)))`
  ),
  '0.0'
);
const LEFT_SHOULDER_MATERIAL_PART_INDEX =
  BODY_MATERIAL_PART_INDEX_BY_TARGET.get('rig.left.shoulder') ?? -1;
const RIGHT_SHOULDER_MATERIAL_PART_INDEX =
  BODY_MATERIAL_PART_INDEX_BY_TARGET.get('rig.right.shoulder') ?? -1;
const EDITOR_MATERIAL_PATTERN_CODE = Object.freeze({
  none: 0,
  weave: 1,
  microfiber: 2,
  velvet: 3,
  carbon: 4,
  rubber: 5,
});

let templatePromise = null;

/* Blender round-trip feature flag (see docs/astronaut-export-plan.md): opt in
 * with ?astroModel=production or localStorage 'acca-astronaut-model' set to
 * 'production'. Fallback chain production → source → remote keeps rollback
 * instant — the default experience never changes until QA passes. */
function productionModelRequested() {
  try {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get('astroModel') || window.localStorage.getItem('acca-astronaut-model');
    return flag === 'production';
  } catch {
    return false;
  }
}

function loadTemplate() {
  if (!templatePromise) {
    const loader = new GLTFLoader();
    const primary = productionModelRequested()
      ? loader.loadAsync(ASTRONAUT_PRODUCTION_MODEL_URL)
      : loader.loadAsync(ASTRONAUT_MODEL_URL);
    templatePromise = primary
      .catch(() => loader.loadAsync(ASTRONAUT_MODEL_URL))
      .catch(() => loader.loadAsync(FALLBACK_MODEL_URL));
  }
  return templatePromise;
}

export function preloadAstronautModel() {
  return loadTemplate();
}

function firstMesh(scene) {
  let found = null;
  scene.updateMatrixWorld(true);
  scene.traverse((object) => {
    if (!found && object.isMesh) found = object;
  });
  return found;
}

function createSuitMaterial(source, envTexture) {
  const material = new THREE.MeshPhysicalMaterial({
    name: 'acca-astronaut-surface',
    map: source?.map || null,
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0,
    clearcoat: 0.08,
    clearcoatRoughness: 0.5,
    envMap: envTexture,
    envMapIntensity: 1.12,
    side: THREE.DoubleSide,
  });

  const uniforms = {
    suit: { value: new THREE.Color(0xebece7) },
    accent: { value: new THREE.Color(0xf28b35) },
    visor: { value: new THREE.Color(0x241f22) },
    packPrimary: { value: new THREE.Color(0xe6e9e6) },
    packSecondary: { value: new THREE.Color(0x17202d) },
    packShadow: { value: new THREE.Color(0x202832) },
    suitStrength: { value: 0 },
    visorStrength: { value: 0 },
    suitFinishRoughness: { value: 0.7 },
    suitFinishMetalness: { value: 0 },
    suitFinishClearcoat: { value: 0.08 },
    suitFinishPattern: { value: EDITOR_MATERIAL_PATTERN_CODE.none },
    suitFinishPatternScale: { value: 1 },
    suitFinishPatternStrength: { value: 0 },
    suitFinishSheen: { value: 0.1 },
    accentFinishRoughness: { value: 0.82 },
    accentFinishMetalness: { value: 0.03 },
    accentFinishClearcoat: { value: 0.02 },
    finishRoughness: { value: 0.7 },
    finishMetalness: { value: 0 },
    finishClearcoat: { value: 0.08 },
    finishStrength: { value: 0 },
  };
  const editorParts = BODY_MATERIAL_TARGET_IDS.map(() => ({
    color: { value: new THREE.Color(0xffffff) },
    surface: { value: new THREE.Vector4(0.7, 0, 0.08, 0) },
    detail: { value: new THREE.Vector4(0, 1, 0, 0) },
  }));
  material.userData.astronautUniforms = uniforms;
  material.userData.astronautEditorParts = editorParts;

  material.onBeforeCompile = (shader) => {
    const editorUniformDeclarations = editorParts.map((_, index) => {
      const slot = index + 1;
      return `uniform vec3 astronautEditorPartColor${slot};
       uniform vec4 astronautEditorPartSurface${slot};
       uniform vec4 astronautEditorPartDetail${slot};`;
    }).join('\n       ');
    const editorUniformSelection = editorParts.map((_, index) => {
      const slot = index + 1;
      return `if (abs(vAstronautEditorPartId - ${slot}.0) < 0.25) {
          astronautEditorPartColorValue = astronautEditorPartColor${slot};
          astronautEditorPartSurfaceValue = astronautEditorPartSurface${slot};
          astronautEditorPartDetailValue = astronautEditorPartDetail${slot};
        }`;
    }).join('\n        ');

    editorParts.forEach((part, index) => {
      const slot = index + 1;
      shader.uniforms[`astronautEditorPartColor${slot}`] = part.color;
      shader.uniforms[`astronautEditorPartSurface${slot}`] = part.surface;
      shader.uniforms[`astronautEditorPartDetail${slot}`] = part.detail;
    });
    shader.uniforms.astronautSuitColor = uniforms.suit;
    shader.uniforms.astronautAccentColor = uniforms.accent;
    shader.uniforms.astronautVisorColor = uniforms.visor;
    shader.uniforms.astronautPackPrimaryColor = uniforms.packPrimary;
    shader.uniforms.astronautPackSecondaryColor = uniforms.packSecondary;
    shader.uniforms.astronautPackShadowColor = uniforms.packShadow;
    shader.uniforms.astronautSuitStrength = uniforms.suitStrength;
    shader.uniforms.astronautVisorStrength = uniforms.visorStrength;
    shader.uniforms.astronautSuitFinishRoughness = uniforms.suitFinishRoughness;
    shader.uniforms.astronautSuitFinishMetalness = uniforms.suitFinishMetalness;
    shader.uniforms.astronautSuitFinishClearcoat = uniforms.suitFinishClearcoat;
    shader.uniforms.astronautSuitFinishPattern = uniforms.suitFinishPattern;
    shader.uniforms.astronautSuitFinishPatternScale = uniforms.suitFinishPatternScale;
    shader.uniforms.astronautSuitFinishPatternStrength = uniforms.suitFinishPatternStrength;
    shader.uniforms.astronautSuitFinishSheen = uniforms.suitFinishSheen;
    shader.uniforms.astronautAccentFinishRoughness = uniforms.accentFinishRoughness;
    shader.uniforms.astronautAccentFinishMetalness = uniforms.accentFinishMetalness;
    shader.uniforms.astronautAccentFinishClearcoat = uniforms.accentFinishClearcoat;
    shader.uniforms.astronautFinishRoughness = uniforms.finishRoughness;
    shader.uniforms.astronautFinishMetalness = uniforms.finishMetalness;
    shader.uniforms.astronautFinishClearcoat = uniforms.finishClearcoat;
    shader.uniforms.astronautFinishStrength = uniforms.finishStrength;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       attribute float astronautEditorPartId;
       attribute float astronautSuitColorMask;
       varying vec3 vAstronautLocalPosition;
       varying float vAstronautEditorPartId;
       varying float vAstronautSuitColorMask;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       vAstronautLocalPosition = position;
       vAstronautEditorPartId = astronautEditorPartId;
       vAstronautSuitColorMask = astronautSuitColorMask;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       uniform vec3 astronautSuitColor;
       uniform vec3 astronautAccentColor;
       uniform vec3 astronautVisorColor;
       uniform vec3 astronautPackPrimaryColor;
       uniform vec3 astronautPackSecondaryColor;
       uniform vec3 astronautPackShadowColor;
       uniform float astronautSuitStrength;
       uniform float astronautVisorStrength;
       uniform float astronautSuitFinishRoughness;
       uniform float astronautSuitFinishMetalness;
       uniform float astronautSuitFinishClearcoat;
       uniform float astronautSuitFinishPattern;
       uniform float astronautSuitFinishPatternScale;
       uniform float astronautSuitFinishPatternStrength;
       uniform float astronautSuitFinishSheen;
       uniform float astronautAccentFinishRoughness;
       uniform float astronautAccentFinishMetalness;
       uniform float astronautAccentFinishClearcoat;
       uniform float astronautFinishRoughness;
       uniform float astronautFinishMetalness;
       uniform float astronautFinishClearcoat;
       uniform float astronautFinishStrength;
       ${editorUniformDeclarations}
       varying vec3 vAstronautLocalPosition;
       varying float vAstronautEditorPartId;
       varying float vAstronautSuitColorMask;
       float astronautVisorSurface = 0.0;
       float astronautHardSurface = 0.0;
       float astronautDarkSurface = 0.0;
       float astronautClothSurface = 0.0;
       float astronautPackSurface = 0.0;
       float astronautHoseSurface = 0.0;
       float astronautAccentSurface = 0.0;
       vec3 astronautEditorPartColorValue = vec3(1.0);
       vec4 astronautEditorPartSurfaceValue = vec4(0.7, 0.0, 0.08, 0.0);
       vec4 astronautEditorPartDetailValue = vec4(0.0);`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `astronautEditorPartColorValue = vec3(1.0);
       astronautEditorPartSurfaceValue = vec4(0.7, 0.0, 0.08, 0.0);
       astronautEditorPartDetailValue = vec4(0.0);
       ${editorUniformSelection}
       float explicitPackShellMask = 1.0 - smoothstep(
         0.05,
         0.25,
         abs(vAstronautEditorPartId - ${PACK_SHELL_MATERIAL_PART_INDEX}.0)
       );
       float explicitHoseMask = ${EXPLICIT_HOSE_MASK_GLSL};
       #ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D(map, vMapUv);
        vec3 texel = sampledDiffuseColor.rgb;
        float luminance = dot(texel, vec3(0.2126, 0.7152, 0.0722));
        float forcedSuitMask = smoothstep(0.36, 0.72, vAstronautSuitColorMask);
        float redMask = smoothstep(0.07, 0.3, texel.r - max(texel.g, texel.b));
        float blueMask = smoothstep(0.07, 0.3, texel.b - max(texel.r, texel.g));
        float leftShoulderPart = 1.0 - smoothstep(
          0.05,
          0.25,
          abs(vAstronautEditorPartId - ${LEFT_SHOULDER_MATERIAL_PART_INDEX}.0)
        );
        float rightShoulderPart = 1.0 - smoothstep(
          0.05,
          0.25,
          abs(vAstronautEditorPartId - ${RIGHT_SHOULDER_MATERIAL_PART_INDEX}.0)
        );
        vec2 wrappedMapUv = fract(vMapUv);
        const float sleeveMarkUvPixel = 1.0 / 1024.0;
        vec2 sleeveMarkUvDelta = (
          wrappedMapUv - vec2(0.531, 0.391)
        ) / (vec2(0.023, 0.022) + vec2(sleeveMarkUvPixel));
        float bakedSleeveMarkShape = 1.0 - smoothstep(
          0.82,
          1.0,
          length(sleeveMarkUvDelta)
        );
        // The source texture reuses this UV island on both sleeves. Remove the
        // complete baked emblem (including its dark edge), not just blue/red pixels.
        float bakedSleeveMarkMask = bakedSleeveMarkShape
          * max(leftShoulderPart, rightShoulderPart);
        float accentMask = clamp(
          max(redMask, blueMask) * (1.0 - bakedSleeveMarkMask),
          0.0,
          1.0
        ) * (1.0 - forcedSuitMask);

        float visorHeight = smoothstep(1.5, 1.64, vAstronautLocalPosition.y);
        float visorCenter = 1.0 - smoothstep(0.2, 0.38, abs(vAstronautLocalPosition.x));
        float visorFront = smoothstep(-0.07, 0.1, vAstronautLocalPosition.z);
        float visorDark = 1.0 - smoothstep(0.25, 0.58, luminance);
        float visorMask = visorHeight * visorCenter * visorFront * visorDark
          * (1.0 - forcedSuitMask);

        float helmetShell = smoothstep(1.48, 1.66, vAstronautLocalPosition.y) * (1.0 - visorMask);
        float plssDepth = 1.0 - smoothstep(-0.13, -0.015, vAstronautLocalPosition.z);
        float plssHeight = smoothstep(0.86, 1.02, vAstronautLocalPosition.y)
          * (1.0 - smoothstep(1.88, 2.02, vAstronautLocalPosition.y));
        float plssMask = max(plssDepth * plssHeight, explicitPackShellMask)
          * (1.0 - forcedSuitMask);
        float chestDepth = smoothstep(0.2, 0.29, vAstronautLocalPosition.z);
        float chestCenter = 1.0 - smoothstep(0.2, 0.36, abs(vAstronautLocalPosition.x));
        float chestHeight = smoothstep(0.9, 1.02, vAstronautLocalPosition.y)
          * (1.0 - smoothstep(1.46, 1.6, vAstronautLocalPosition.y));
        float chestMask = chestDepth * chestCenter * chestHeight
          * (1.0 - forcedSuitMask);
        float hardMask = max(helmetShell, max(plssMask, chestMask));
        float hoseHeight = smoothstep(0.94, 1.05, vAstronautLocalPosition.y)
          * (1.0 - smoothstep(1.43, 1.55, vAstronautLocalPosition.y));
        float hoseSide = smoothstep(0.12, 0.18, abs(vAstronautLocalPosition.x))
          * (1.0 - smoothstep(0.28, 0.34, abs(vAstronautLocalPosition.x)));
        float hoseFront = smoothstep(0.08, 0.2, vAstronautLocalPosition.z);
        float hoseLight = smoothstep(0.42, 0.7, luminance);
        float hoseMask = max(
          hoseHeight * hoseSide * hoseFront * hoseLight * (1.0 - accentMask),
          explicitHoseMask
        ) * (1.0 - forcedSuitMask);
        float darkMask = (1.0 - smoothstep(0.16, 0.34, luminance))
          * (1.0 - visorMask)
          * (1.0 - bakedSleeveMarkMask)
          * (1.0 - forcedSuitMask);
        float clothMask = max(
          max(
            smoothstep(0.09, 0.3, luminance)
            * (1.0 - accentMask)
            * (1.0 - visorMask)
            * (1.0 - hardMask),
            forcedSuitMask
          ),
          bakedSleeveMarkMask
        );
        float clothShade = clamp(0.38 + luminance * 0.72, 0.35, 1.05);
        float cleanSleeveClothShade = mix(
          clothShade,
          0.82,
          bakedSleeveMarkMask
        );
        float suitPattern = 0.0;
        vec2 suitPatternUv = vAstronautLocalPosition.xy
          * max(1.0, astronautSuitFinishPatternScale);
        if (abs(astronautSuitFinishPattern - 1.0) < 0.25) {
          suitPattern = sin(suitPatternUv.x) * sin(suitPatternUv.y);
        } else if (abs(astronautSuitFinishPattern - 2.0) < 0.25) {
          suitPattern = fract(
            sin(dot(suitPatternUv, vec2(12.9898, 78.233))) * 43758.5453
          ) * 2.0 - 1.0;
        } else if (abs(astronautSuitFinishPattern - 3.0) < 0.25) {
          suitPattern = 0.55 * sin(suitPatternUv.x * 0.34)
            + 0.45 * sin(suitPatternUv.y * 0.27);
        }
        vec3 cleanSuit = astronautSuitColor
          * cleanSleeveClothShade
          * (1.0 + suitPattern * astronautSuitFinishPatternStrength);
        vec3 cleanShell = mix(astronautSuitColor, vec3(0.98), 0.12) * clamp(0.45 + luminance * 0.68, 0.42, 1.04);
        vec3 cleanAccent = astronautAccentColor * clamp(0.48 + luminance * 0.74, 0.42, 1.1);
        vec3 cleanVisor = astronautVisorColor * clamp(0.32 + luminance * 1.1, 0.25, 0.92);
        vec3 cleanPackPrimary = astronautPackPrimaryColor * clamp(0.48 + luminance * 0.68, 0.42, 1.04);
        vec3 cleanPackSecondary = astronautPackSecondaryColor * clamp(0.48 + luminance * 0.72, 0.4, 1.05);
        vec3 cleanPackShadow = astronautPackShadowColor * clamp(0.38 + luminance * 0.58, 0.32, 0.82);
        vec3 cleanHoseTitanium = vec3(0.46, 0.57, 0.66)
          * clamp(0.72 + luminance * 0.42, 0.68, 1.06);
        float packDarkMask = darkMask * plssMask;
        float nonPackDarkMask = darkMask * (1.0 - plssMask);
        float packPrimaryMix = mix(0.9, 0.98, explicitPackShellMask);
        float visorEdge = smoothstep(0.07, 0.29, abs(vAstronautLocalPosition.x));
        vec3 smokyVisor = mix(vec3(0.045, 0.05, 0.06), vec3(0.46, 0.235, 0.055), visorEdge);
        smokyVisor *= 0.58 + luminance * 0.72;

        astronautVisorSurface = visorMask;
        astronautHardSurface = hardMask;
        astronautDarkSurface = darkMask;
        astronautClothSurface = clothMask;
        astronautPackSurface = plssMask;
        astronautHoseSurface = hoseMask;
        astronautAccentSurface = accentMask;

        texel = mix(texel, smokyVisor, visorMask * 0.28);
        float cleanSuitColorMix = max(
          clothMask * astronautSuitStrength,
          bakedSleeveMarkMask
        );
        texel = mix(texel, cleanSuit, cleanSuitColorMix);
        texel = mix(texel, cleanShell, max(helmetShell, chestMask) * astronautSuitStrength * (1.0 - accentMask));
        // Gloves and boots follow pack details; PLSS recesses have their own
        // dark palette so a bright pack never produces a bright fake shadow.
        texel = mix(texel, cleanPackSecondary, nonPackDarkMask * 0.85);
        texel = mix(texel, cleanPackShadow, packDarkMask * 0.92);
        texel = mix(texel, cleanAccent, accentMask * 0.94);
        texel = mix(texel, cleanPackPrimary, plssMask * packPrimaryMix * (1.0 - darkMask));
        texel = mix(texel, cleanHoseTitanium, hoseMask);
        texel = mix(texel, cleanVisor, visorMask * astronautVisorStrength);
        texel = mix(texel, cleanSuit, forcedSuitMask * astronautSuitStrength);

        float editorPattern = 0.0;
        float editorPatternCode = astronautEditorPartDetailValue.x;
        float editorPatternScale = max(1.0, astronautEditorPartDetailValue.y);
        vec2 editorPatternUv = vAstronautLocalPosition.xy * editorPatternScale;
        if (abs(editorPatternCode - 1.0) < 0.25) {
          editorPattern = sin(editorPatternUv.x) * sin(editorPatternUv.y);
        } else if (abs(editorPatternCode - 2.0) < 0.25) {
          editorPattern = fract(sin(dot(editorPatternUv, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
        } else if (abs(editorPatternCode - 3.0) < 0.25) {
          editorPattern = 0.55 * sin(editorPatternUv.x * 0.34) + 0.45 * sin(editorPatternUv.y * 0.27);
        } else if (abs(editorPatternCode - 4.0) < 0.25) {
          editorPattern = sin((editorPatternUv.x + editorPatternUv.y) * 0.72)
            * sin((editorPatternUv.x - editorPatternUv.y) * 0.72);
        } else if (abs(editorPatternCode - 5.0) < 0.25) {
          editorPattern = fract(sin(dot(floor(editorPatternUv), vec2(41.37, 17.17))) * 16453.31) * 2.0 - 1.0;
        }
        float editorPartStrength = astronautEditorPartSurfaceValue.w;
        float editorPatternAmount = editorPattern
          * astronautEditorPartDetailValue.z
          * editorPartStrength;
        vec3 editorPartColor = astronautEditorPartColorValue
          * clamp(0.4 + luminance * 0.7, 0.34, 1.08)
          * (1.0 + editorPatternAmount);
        texel = mix(texel, editorPartColor, editorPartStrength * 0.96);
        diffuseColor *= vec4(texel, sampledDiffuseColor.a);
      #endif`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
       float astronautFabricNoise = fract(sin(dot(vAstronautLocalPosition.xy * 173.0, vec2(12.9898, 78.233))) * 43758.5453);
       float astronautFabricRoughness = 0.75 + (astronautFabricNoise - 0.5) * 0.055;
       roughnessFactor = mix(roughnessFactor, astronautFabricRoughness, astronautClothSurface * 0.92);
       roughnessFactor = mix(roughnessFactor, astronautSuitFinishRoughness, astronautClothSurface * 0.96);
       roughnessFactor = mix(roughnessFactor, 0.34, astronautHardSurface * 0.94);
       roughnessFactor = mix(roughnessFactor, 0.26, astronautDarkSurface * 0.68);
       roughnessFactor = mix(roughnessFactor, 0.24, astronautPackSurface * 0.92);
       roughnessFactor = mix(roughnessFactor, 0.22, astronautHoseSurface * 0.96);
       roughnessFactor = mix(roughnessFactor, astronautAccentFinishRoughness, astronautAccentSurface * 0.94);
       roughnessFactor = mix(roughnessFactor, 0.085, astronautVisorSurface);
       float astronautFinishSurface = max(astronautClothSurface, astronautHardSurface) * (1.0 - astronautVisorSurface);
       roughnessFactor = mix(roughnessFactor, astronautFinishRoughness, astronautFinishSurface * astronautFinishStrength * 0.94);
       roughnessFactor = mix(
         roughnessFactor,
         astronautEditorPartSurfaceValue.x,
         astronautEditorPartSurfaceValue.w
       );`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <metalnessmap_fragment>',
      `#include <metalnessmap_fragment>
       metalnessFactor = mix(metalnessFactor, 0.0, astronautClothSurface);
       metalnessFactor = mix(metalnessFactor, 0.025, astronautHardSurface);
       metalnessFactor = mix(metalnessFactor, 0.24, astronautDarkSurface * 0.72);
       metalnessFactor = mix(metalnessFactor, astronautSuitFinishMetalness, astronautClothSurface * 0.96);
       metalnessFactor = mix(metalnessFactor, 0.86, astronautPackSurface * 0.92);
       metalnessFactor = mix(metalnessFactor, 0.9, astronautHoseSurface * 0.96);
       metalnessFactor = mix(metalnessFactor, astronautAccentFinishMetalness, astronautAccentSurface * 0.94);
       metalnessFactor = mix(metalnessFactor, 0.16, astronautVisorSurface);
       metalnessFactor = mix(metalnessFactor, astronautFinishMetalness, astronautFinishSurface * astronautFinishStrength * 0.94);
       metalnessFactor = mix(
         metalnessFactor,
         astronautEditorPartSurfaceValue.y,
         astronautEditorPartSurfaceValue.w
       );`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_physical_fragment>',
      `#include <lights_physical_fragment>
       #ifdef USE_CLEARCOAT
         material.clearcoat = mix(material.clearcoat, 0.32, astronautHardSurface);
         material.clearcoatRoughness = mix(material.clearcoatRoughness, 0.24, astronautHardSurface);
         material.clearcoat = mix(material.clearcoat, astronautSuitFinishClearcoat, astronautClothSurface * 0.96);
         material.clearcoatRoughness = mix(material.clearcoatRoughness, max(0.025, astronautSuitFinishRoughness * 0.45), astronautClothSurface * 0.96);
         material.clearcoat = mix(material.clearcoat, 0.34, astronautPackSurface * 0.92);
         material.clearcoatRoughness = mix(material.clearcoatRoughness, 0.12, astronautPackSurface * 0.92);
         material.clearcoat = mix(material.clearcoat, 0.26, astronautHoseSurface * 0.96);
         material.clearcoatRoughness = mix(material.clearcoatRoughness, 0.11, astronautHoseSurface * 0.96);
         material.clearcoat = mix(material.clearcoat, astronautAccentFinishClearcoat, astronautAccentSurface * 0.94);
         material.clearcoatRoughness = mix(material.clearcoatRoughness, max(0.025, astronautAccentFinishRoughness * 0.42), astronautAccentSurface * 0.94);
         material.clearcoat = mix(material.clearcoat, 0.92, astronautVisorSurface);
         material.clearcoatRoughness = mix(material.clearcoatRoughness, 0.065, astronautVisorSurface);
         material.clearcoat = mix(material.clearcoat, astronautFinishClearcoat, astronautFinishSurface * astronautFinishStrength);
         material.clearcoatRoughness = mix(material.clearcoatRoughness, max(0.025, astronautFinishRoughness * 0.45), astronautFinishSurface * astronautFinishStrength);
         material.clearcoat = mix(
           material.clearcoat,
           astronautEditorPartSurfaceValue.z,
           astronautEditorPartSurfaceValue.w
         );
         material.clearcoatRoughness = mix(
           material.clearcoatRoughness,
           max(0.025, astronautEditorPartSurfaceValue.x * 0.45),
           astronautEditorPartSurfaceValue.w
         );
       #endif`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `float astronautFresnel = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), 3.0);
       outgoingLight += vec3(0.3, 0.135, 0.035) * astronautFresnel * astronautVisorSurface * 0.34;
       outgoingLight += astronautSuitColor
         * astronautFresnel
         * astronautClothSurface
         * astronautSuitFinishSheen
         * 0.12;
       outgoingLight += astronautEditorPartColorValue
         * astronautFresnel
         * astronautEditorPartDetailValue.w
         * astronautEditorPartSurfaceValue.w
         * 0.26;
       #include <opaque_fragment>`
    );
  };
  material.customProgramCacheKey = () => `acca-astronaut-surface-v12-${material.uuid}`;
  return material;
}

export async function buildAstronaut(rawConfig, { envTexture = null } = {}) {
  const config = sanitizeAstronautConfig(rawConfig);
  const template = await loadTemplate();
  const sourceMesh = firstMesh(template.scene);
  if (!sourceMesh) throw new Error('Astronaut mesh was not found');

  const holder = new THREE.Group();
  const inner = new THREE.Group();
  const motionRoot = new THREE.Group();
  const editorRoot = new THREE.Group();
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  const sourceMaterial = Array.isArray(sourceMesh.material) ? sourceMesh.material[0] : sourceMesh.material;
  const bodyMaterial = createSuitMaterial(sourceMaterial, envTexture);
  materials.add(bodyMaterial);

  const rig = createAstronautRig(sourceMesh, bodyMaterial, geometries);
  /* Stable customizer contract ids (config/astronaut-customizer.json) —
     Blender stamps the same web_id custom properties on its side. */
  bodyMaterial.userData.web_id = 'mat.astronaut.body';
  rig.root.traverse((object) => {
    if (object.isSkinnedMesh) object.userData.web_id = 'obj.astronaut.body';
  });
  const center = rig.bounds.getCenter(new THREE.Vector3());
  const size = rig.bounds.getSize(new THREE.Vector3());
  const scale = 1.84 / (Math.max(size.x, size.y, size.z) || 1);
  rig.root.scale.setScalar(scale);
  rig.root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  const hardware = createAstronautHardware({ envTexture, rig, geometries, materials, textures });
  editorRoot.name = 'Astronaut editor root';
  editorRoot.add(rig.root, hardware.root);
  motionRoot.add(editorRoot);
  inner.add(motionRoot);
  holder.add(inner);

  holder.userData.baseY = 0.01;
  holder.userData.baseScale = 1;
  holder.userData.baseRotation = new THREE.Euler(-0.07, -0.34, -0.12);
  holder.position.y = holder.userData.baseY;
  holder.rotation.copy(holder.userData.baseRotation);

  let currentConfig = config;
  const editorTargets = new Map();

  function registerEditorTarget(id, object, options = {}) {
    if (!object) return;
    object.userData.web_id = id;
    object.userData.editorTargetId = id;
    editorTargets.set(id, {
      id,
      object,
      preserveColor: false,
      materialId: 'default',
      materialBindings: [],
      base: {
        position: object.position.clone(),
        rotation: new THREE.Euler(object.rotation.x, object.rotation.y, object.rotation.z, object.rotation.order),
        scale: object.scale.clone(),
      },
      ...options,
    });
  }

  registerEditorTarget('edit.character', editorRoot, { bodyMaterial: true });
  Object.values(rig.editorControls).forEach((object) => {
    const id = object.userData.web_id;
    registerEditorTarget(id, object, {
      bodyMaterialPartIndex: BODY_MATERIAL_PART_INDEX_BY_TARGET.get(id) || 0,
    });
  });
  hardware.editorTargets.forEach((options, id) => {
    registerEditorTarget(id, options.object, options);
  });
  rig.root.traverse((object) => {
    if (object.isSkinnedMesh) object.userData.editorTargetId = 'edit.character';
  });

  function restoreTargetMaterials(entry) {
    if (entry.bodyMaterialPartIndex) {
      const part = bodyMaterial.userData.astronautEditorParts[entry.bodyMaterialPartIndex - 1];
      part.color.value.setHex(0xffffff);
      part.surface.value.set(0.7, 0, 0.08, 0);
      part.detail.value.set(0, 1, 0, 0);
      entry.materialId = 'default';
      return;
    }
    entry.materialBindings.forEach((binding) => {
      if (binding.direct) {
        Object.assign(binding.material, binding.original);
        binding.material.needsUpdate = true;
        return;
      }
      binding.mesh.material = binding.original;
      binding.clones.forEach((clone) => {
        materials.delete(clone);
        clone.dispose();
      });
    });
    entry.materialBindings = [];
    entry.materialId = 'default';
  }

  function syncPreservedTargetAppearance(entry) {
    entry.materialBindings.forEach((binding) => {
      if (!binding.preserveColor) return;
      const sourceMaterials = Array.isArray(binding.original)
        ? binding.original
        : [binding.original];
      binding.clones.forEach((clone, index) => {
        const source = sourceMaterials[index];
        if (!source) return;
        if (clone.color && source.color) clone.color.copy(source.color);
        if (clone.emissive && source.emissive) clone.emissive.copy(source.emissive);
        if ('emissiveIntensity' in clone && 'emissiveIntensity' in source) {
          clone.emissiveIntensity = source.emissiveIntensity;
        }
        ['map', 'alphaMap', 'emissiveMap'].forEach((property) => {
          if (property in clone && clone[property] !== source[property]) {
            clone[property] = source[property];
          }
        });
        clone.transparent = source.transparent;
        clone.opacity = source.opacity;
        clone.needsUpdate = true;
      });
    });
  }

  function applyTargetMaterial(entry, materialId) {
    if (entry.bodyMaterial) return;
    if (entry.materialId === materialId) {
      syncPreservedTargetAppearance(entry);
      return;
    }
    restoreTargetMaterials(entry);
    const preset = EDITOR_MATERIAL_BY_ID.get(materialId);
    if (!preset) return;

    if (entry.bodyMaterialPartIndex) {
      const part = bodyMaterial.userData.astronautEditorParts[entry.bodyMaterialPartIndex - 1];
      part.color.value.setHex(preset.hex);
      part.surface.value.set(
        preset.roughness,
        preset.metalness,
        preset.clearcoat,
        1
      );
      part.detail.value.set(
        EDITOR_MATERIAL_PATTERN_CODE[preset.pattern || 'none'] || 0,
        preset.patternScale || 1,
        preset.patternStrength || 0,
        preset.sheen || 0
      );
      entry.materialId = materialId;
      return;
    }

    entry.object.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const clones = sourceMaterials.map((sourceMaterial) => {
        const clone = sourceMaterial.clone();
        const emissive = clone.emissive?.getHex?.() || 0;
        const isLitControl = emissive !== 0 || clone.blending === THREE.AdditiveBlending;
        if (!entry.preserveColor && clone.color && !isLitControl) {
          clone.color.setHex(preset.hex);
        }
        if (!isLitControl) {
          if ('roughness' in clone) clone.roughness = preset.roughness;
          if ('metalness' in clone) clone.metalness = preset.metalness;
          if ('clearcoat' in clone) clone.clearcoat = preset.clearcoat;
          if ('clearcoatRoughness' in clone) clone.clearcoatRoughness = Math.max(0.025, preset.roughness * 0.45);
          if ('envMapIntensity' in clone) clone.envMapIntensity = 1.1 + preset.metalness * 0.85;
        }
        clone.needsUpdate = true;
        materials.add(clone);
        return clone;
      });
      entry.materialBindings.push({
        mesh: object,
        original: object.material,
        clones,
        preserveColor: entry.preserveColor,
      });
      object.material = Array.isArray(object.material) ? clones : clones[0];
    });
    entry.materialId = materialId;
  }

  function applyEditorTransforms() {
    editorTargets.forEach((entry, id) => {
      const state = getAstronautEditorTargetState(currentConfig, id);
      const position = state.position;
      const rotation = state.rotation;
      const targetScale = state.scale;
      entry.object.position.set(
        entry.base.position.x + position[0],
        entry.base.position.y + position[1],
        entry.base.position.z + position[2]
      );
      entry.object.rotation.set(
        entry.base.rotation.x + THREE.MathUtils.degToRad(rotation[0]),
        entry.base.rotation.y + THREE.MathUtils.degToRad(rotation[1]),
        entry.base.rotation.z + THREE.MathUtils.degToRad(rotation[2]),
        entry.base.rotation.order
      );
      entry.object.scale.set(
        entry.base.scale.x * targetScale[0],
        entry.base.scale.y * targetScale[1],
        entry.base.scale.z * targetScale[2]
      );
      applyTargetMaterial(entry, state.material);
    });
  }

  function captureEditorTransform(id) {
    const entry = editorTargets.get(id);
    if (!entry) return null;
    const round = (value) => Math.round(value * 1000) / 1000;
    const state = getAstronautEditorTargetState(currentConfig, id);
    return {
      position: [
        round(entry.object.position.x - entry.base.position.x),
        round(entry.object.position.y - entry.base.position.y),
        round(entry.object.position.z - entry.base.position.z),
      ],
      rotation: [
        round(THREE.MathUtils.radToDeg(entry.object.rotation.x - entry.base.rotation.x)),
        round(THREE.MathUtils.radToDeg(entry.object.rotation.y - entry.base.rotation.y)),
        round(THREE.MathUtils.radToDeg(entry.object.rotation.z - entry.base.rotation.z)),
      ],
      scale: [
        round(entry.object.scale.x / entry.base.scale.x),
        round(entry.object.scale.y / entry.base.scale.y),
        round(entry.object.scale.z / entry.base.scale.z),
      ],
      material: state.material,
    };
  }

  function applyConfig(nextRawConfig) {
    currentConfig = sanitizeAstronautConfig(nextRawConfig);
    const colors = resolveAstronautColors(currentConfig);
    const uniforms = bodyMaterial.userData.astronautUniforms;
    uniforms.suit.value.setHex(colors.suit);
    uniforms.accent.value.setHex(colors.accent);
    uniforms.visor.value.setHex(colors.visor);
    uniforms.packPrimary.value.setHex(colors.packPrimary);
    uniforms.packSecondary.value.setHex(colors.packSecondary);
    uniforms.packShadow.value.setHex(colors.packShadow);
    const suitFinish = SUIT_FINISH_BY_ID.get(currentConfig.suitFinish)
      || SUIT_FINISH_BY_ID.get('standard');
    const accentFinish = ACCENT_FINISH_BY_ID.get(currentConfig.accentFinish)
      || ACCENT_FINISH_BY_ID.get('matte');
    uniforms.suitFinishRoughness.value = suitFinish.roughness;
    uniforms.suitFinishMetalness.value = suitFinish.metalness;
    uniforms.suitFinishClearcoat.value = suitFinish.clearcoat;
    uniforms.suitFinishPattern.value =
      EDITOR_MATERIAL_PATTERN_CODE[suitFinish.pattern || 'none'] || 0;
    uniforms.suitFinishPatternScale.value = suitFinish.patternScale || 1;
    uniforms.suitFinishPatternStrength.value = suitFinish.patternStrength || 0;
    uniforms.suitFinishSheen.value = suitFinish.sheen || 0;
    uniforms.accentFinishRoughness.value = accentFinish.roughness;
    uniforms.accentFinishMetalness.value = accentFinish.metalness;
    uniforms.accentFinishClearcoat.value = accentFinish.clearcoat;
    const bodyFinishId = getAstronautEditorTargetState(currentConfig, 'edit.character').material;
    const bodyFinish = EDITOR_MATERIAL_BY_ID.get(bodyFinishId);
    uniforms.suit.value.setHex(bodyFinish?.hex ?? colors.suit);
    uniforms.suitStrength.value = currentConfig.suit === 'eva' && !bodyFinish ? 0 : 1;
    uniforms.visorStrength.value = currentConfig.visor === 'original' ? 0 : 0.9;
    uniforms.finishRoughness.value = bodyFinish?.roughness ?? 0.7;
    uniforms.finishMetalness.value = bodyFinish?.metalness ?? 0;
    uniforms.finishClearcoat.value = bodyFinish?.clearcoat ?? 0.08;
    uniforms.finishStrength.value = bodyFinish ? 1 : 0;
    hardware.setConfig(currentConfig, colors);
    applyEditorTransforms();
    return currentConfig;
  }

  applyConfig(config);

  function update(time) {
    const motion = updateAstronautRig(rig, currentConfig.pose, time);
    motionRoot.position.copy(motion.position);
    motionRoot.position.y += Math.sin(time * 0.82) * motion.bob;
    motionRoot.rotation.copy(motion.rotation);
    inner.scale.setScalar(1 + Math.sin(time * 0.68) * 0.0035);
    hardware.update(time);
  }

  function dispose() {
    rig.skeleton.dispose();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
  }

  return {
    group: holder,
    applyConfig,
    captureEditorTransform,
    getEditorTarget(id) {
      return editorTargets.get(id)?.object || null;
    },
    findEditorTarget(object) {
      let current = object;
      while (current && current !== holder) {
        if (current.userData.editorTargetId) return current.userData.editorTargetId;
        current = current.parent;
      }
      return null;
    },
    update,
    dispose,
    get config() {
      return currentConfig;
    },
  };
}
