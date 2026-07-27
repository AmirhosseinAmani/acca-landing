import * as THREE from 'three';
import { buildAstronaut } from './buildAstronaut';
import { createStudioReflectionTexture } from './astronautSceneUtils';

const TAU = Math.PI * 2;
const requestWorkerFrame = typeof self.requestAnimationFrame === 'function'
  ? self.requestAnimationFrame.bind(self)
  : (callback) => self.setTimeout(() => callback(performance.now()), 16);
const cancelWorkerFrame = typeof self.cancelAnimationFrame === 'function'
  ? self.cancelAnimationFrame.bind(self)
  : self.clearTimeout.bind(self);

let renderer = null;
let scene = null;
let camera = null;
let astronaut = null;
let modelRoot = null;
let orbitGroup = null;
let stars = null;
let environment = null;
let frame = 0;
let active = true;
let reduceMotion = false;
let disposed = false;
let darkMode = false;
let currentConfig = null;
let previous = 0;
let startedAt = 0;
let yaw = 0;
let targetYaw = 0;
let lights = null;

function createStarField(count = 88) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = 3 + ((index * 17) % 100) / 36;
    const angle = (index * 2.399963) % TAU;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = -1.8 + ((index * 37) % 100) / 24;
    positions[index * 3 + 2] = -2 + Math.sin(angle) * radius * 0.54;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function createOrbitLine(radiusX, radiusY, color, opacity) {
  const points = [];
  for (let index = 0; index < 180; index += 1) {
    const angle = (index / 180) * TAU;
    points.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0));
  }
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
}

function createOrbitSystem(isDark) {
  const group = new THREE.Group();
  group.position.set(0.02, 0.18, -0.68);

  const teal = createOrbitLine(1.32, 0.66, isDark ? 0x82ffe4 : 0x0e9f84, isDark ? 0.32 : 0.22);
  teal.userData.orbitKind = 'teal';
  teal.rotation.set(0.7, 0.2, -0.24);
  group.add(teal);

  const tall = createOrbitLine(0.84, 1.22, isDark ? 0xb7fff1 : 0x33cdb6, isDark ? 0.22 : 0.16);
  tall.userData.orbitKind = 'tall';
  tall.rotation.set(0.2, -0.18, 0.08);
  group.add(tall);

  const gold = createOrbitLine(1.06, 0.4, 0xe8c067, 0.18);
  gold.userData.orbitKind = 'gold';
  gold.rotation.set(-0.42, 0.1, 0.78);
  group.add(gold);

  return group;
}

function applyTheme(nextDarkMode) {
  if (!renderer || !scene || !lights) return;
  darkMode = Boolean(nextDarkMode);
  renderer.toneMappingExposure = darkMode ? 1.18 : 1.04;

  lights.ambient.color.setHex(darkMode ? 0xbfd6ff : 0xffffff);
  lights.ambient.intensity = darkMode ? 0.42 : 0.46;
  lights.key.color.setHex(darkMode ? 0xeaf1ff : 0xffffff);
  lights.key.intensity = darkMode ? 3.2 : 2.8;
  lights.rim.color.setHex(darkMode ? 0x7df9ff : 0x36d9b0);
  lights.rim.intensity = darkMode ? 2.1 : 1.5;
  lights.warm.intensity = darkMode ? 1.45 : 0.95;

  orbitGroup?.traverse((object) => {
    if (!object.material) return;
    if (object.userData.orbitKind === 'teal') {
      object.material.color.setHex(darkMode ? 0x82ffe4 : 0x0e9f84);
      object.material.opacity = darkMode ? 0.32 : 0.22;
    } else if (object.userData.orbitKind === 'tall') {
      object.material.color.setHex(darkMode ? 0xb7fff1 : 0x33cdb6);
      object.material.opacity = darkMode ? 0.22 : 0.16;
    }
  });
  if (stars?.material) {
    stars.material.color.setHex(darkMode ? 0xbfffe9 : 0xffffff);
    stars.material.size = darkMode ? 0.038 : 0.026;
    stars.material.opacity = darkMode ? 0.72 : 0.46;
    stars.material.needsUpdate = true;
  }

  const previousEnvironment = environment;
  environment = createStudioReflectionTexture(darkMode);
  scene.environment = environment;
  scene.traverse((object) => {
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
    objectMaterials.filter(Boolean).forEach((material) => {
      if (material.envMap === previousEnvironment) {
        material.envMap = environment;
        material.needsUpdate = true;
      }
    });
  });
  previousEnvironment?.dispose();
  renderOnce();
}

function resize({ width, height, dpr }) {
  if (!renderer || !camera) return;
  renderer.setPixelRatio(Math.min(Number(dpr) || 1, 1.65));
  renderer.setSize(Math.max(1, width), Math.max(1, height), false);
  camera.aspect = Math.max(1, width) / Math.max(1, height);
  camera.updateProjectionMatrix();
  renderOnce();
}

function renderOnce(now = performance.now()) {
  if (!renderer || !scene || !camera || disposed) return;
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const delta = previous ? Math.min(0.033, (now - previous) / 1000) : 0;
  previous = now;

  yaw = THREE.MathUtils.lerp(yaw, targetYaw, 0.12);
  astronaut?.update(elapsed, delta);

  if (modelRoot) {
    const baseRotation = modelRoot.userData.baseRotation;
    modelRoot.position.y = modelRoot.userData.baseY + Math.sin(elapsed * 1.02) * 0.072;
    modelRoot.rotation.y = baseRotation.y + yaw + Math.sin(elapsed * 0.52) * 0.11;
    modelRoot.rotation.z = baseRotation.z + Math.sin(elapsed * 0.62) * 0.04;
    modelRoot.rotation.x = baseRotation.x + Math.sin(elapsed * 0.44) * 0.025;
  }

  if (orbitGroup) {
    orbitGroup.rotation.z = elapsed * 0.1;
    orbitGroup.rotation.y = Math.sin(elapsed * 0.28) * 0.18;
  }
  if (stars) {
    stars.rotation.y = elapsed * 0.018;
    stars.rotation.z = Math.sin(elapsed * 0.2) * 0.05;
  }
  renderer.render(scene, camera);
}

function renderLoop(now) {
  frame = 0;
  if (!active || reduceMotion || disposed || !modelRoot) return;
  renderOnce(now);
  frame = requestWorkerFrame(renderLoop);
}

function syncAnimation() {
  if (!active || reduceMotion || disposed || !modelRoot) {
    if (frame) {
      cancelWorkerFrame(frame);
      frame = 0;
    }
    renderOnce();
    return;
  }
  if (!frame) frame = requestWorkerFrame(renderLoop);
}

async function initialize(payload) {
  const {
    canvas,
    width,
    height,
    dpr,
    config,
    preferProduction,
  } = payload;
  darkMode = Boolean(payload.darkMode);
  reduceMotion = Boolean(payload.reduceMotion);
  currentConfig = config;
  disposed = false;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(26, 1, 0.1, 80);
  camera.position.set(0, 0.16, 5.45);
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = darkMode ? 1.18 : 1.04;
  renderer.setClearColor(0x000000, 0);

  environment = createStudioReflectionTexture(darkMode);
  scene.environment = environment;

  const ambient = new THREE.AmbientLight(darkMode ? 0xbfd6ff : 0xffffff, darkMode ? 0.42 : 0.46);
  const key = new THREE.DirectionalLight(darkMode ? 0xeaf1ff : 0xffffff, darkMode ? 3.2 : 2.8);
  key.position.set(2.8, 4.2, 5.2);
  const rim = new THREE.DirectionalLight(darkMode ? 0x7df9ff : 0x36d9b0, darkMode ? 2.1 : 1.5);
  rim.position.set(-4, 1.6, -2.8);
  const warm = new THREE.PointLight(0xffd99a, darkMode ? 1.45 : 0.95, 8);
  warm.position.set(-1.8, 1.8, 2.2);
  lights = { ambient, key, rim, warm };
  scene.add(ambient, key, rim, warm);

  orbitGroup = createOrbitSystem(darkMode);
  scene.add(orbitGroup);
  stars = new THREE.Points(
    createStarField(darkMode ? 110 : 78),
    new THREE.PointsMaterial({
      color: darkMode ? 0xbfffe9 : 0xffffff,
      size: darkMode ? 0.038 : 0.026,
      transparent: true,
      opacity: darkMode ? 0.72 : 0.46,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  stars.position.set(0, 0, -1.2);
  scene.add(stars);
  resize({ width, height, dpr });

  astronaut = await buildAstronaut(currentConfig, {
    envTexture: environment,
    preferProduction,
  });
  if (disposed) {
    astronaut.dispose();
    astronaut = null;
    return;
  }
  astronaut.applyConfig(currentConfig);
  modelRoot = astronaut.group;
  scene.add(modelRoot);
  startedAt = performance.now();
  previous = startedAt;
  renderOnce(startedAt);
  self.postMessage({ type: 'ready' });
  syncAnimation();
}

function disposeScene() {
  disposed = true;
  if (frame) cancelWorkerFrame(frame);
  frame = 0;
  if (astronaut) {
    scene?.remove(astronaut.group);
    astronaut.dispose();
    astronaut = null;
  }
  modelRoot = null;
  const sceneMaterials = new Set();
  scene?.traverse((object) => {
    object.geometry?.dispose();
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
    objectMaterials.filter(Boolean).forEach((material) => sceneMaterials.add(material));
  });
  sceneMaterials.forEach((material) => material.dispose());
  environment?.dispose();
  renderer?.dispose();
  renderer = null;
  scene = null;
  camera = null;
  orbitGroup = null;
  stars = null;
  lights = null;
}

self.onmessage = (event) => {
  const message = event.data;
  if (!message || disposed) return;
  if (message.type === 'init') {
    initialize(message).catch((error) => {
      self.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Astronaut worker failed',
      });
    });
    return;
  }
  if (message.type === 'resize') resize(message);
  if (message.type === 'config') {
    currentConfig = message.config;
    astronaut?.applyConfig(currentConfig);
    renderOnce();
  }
  if (message.type === 'theme') applyTheme(message.darkMode);
  if (message.type === 'rotate') {
    targetYaw += Number(message.deltaX || 0) * 0.0075;
    syncAnimation();
  }
  if (message.type === 'reset-rotation') {
    targetYaw = 0;
    syncAnimation();
  }
  if (message.type === 'active') {
    active = Boolean(message.active);
    syncAnimation();
  }
  if (message.type === 'dispose') disposeScene();
};
