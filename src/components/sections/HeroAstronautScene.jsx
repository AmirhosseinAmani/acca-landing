import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ASTRONAUT_MODEL_URL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
const TAU = Math.PI * 2;

function createStudioReflectionTexture(darkMode) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  sky.addColorStop(0, darkMode ? '#111a34' : '#eef5ff');
  sky.addColorStop(0.34, darkMode ? '#526483' : '#d6e2f1');
  sky.addColorStop(0.58, darkMode ? '#f7ead8' : '#fff2dc');
  sky.addColorStop(1, darkMode ? '#0a1020' : '#8b94a6');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = 'blur(18px)';
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.ellipse(520 + i * 16, 250 - i * 18, 210 - i * 8, 46 + i * 3, -0.56, 0, TAU);
    ctx.strokeStyle = `rgba(255, ${236 - i * 6}, ${211 - i * 10}, ${0.26 - i * 0.014})`;
    ctx.lineWidth = 22 - i;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(336, 132, 160, 52, -0.32, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,0.74)';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(760, 126, 190, 42, 0.48, 0, TAU);
  ctx.fillStyle = darkMode ? 'rgba(126,164,255,0.32)' : 'rgba(133,163,218,0.30)';
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  return texture;
}

function createStarField(count = 88) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 3 + ((i * 17) % 100) / 36;
    const angle = (i * 2.399963) % TAU;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = -1.8 + ((i * 37) % 100) / 24;
    positions[i * 3 + 2] = -2 + Math.sin(angle) * radius * 0.54;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function createOrbitLine(radiusX, radiusY, color, opacity) {
  const points = [];
  for (let i = 0; i < 180; i += 1) {
    const angle = (i / 180) * TAU;
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

function createOrbitSystem(darkMode) {
  const group = new THREE.Group();
  group.position.set(0.04, 0.12, -0.55);

  const teal = createOrbitLine(1.68, 0.84, darkMode ? 0x82ffe4 : 0x0e9f84, darkMode ? 0.34 : 0.24);
  teal.rotation.set(0.7, 0.2, -0.24);
  group.add(teal);

  const tall = createOrbitLine(1.06, 1.58, darkMode ? 0xb7fff1 : 0x33cdb6, darkMode ? 0.24 : 0.18);
  tall.rotation.set(0.2, -0.18, 0.08);
  group.add(tall);

  const gold = createOrbitLine(1.36, 0.5, 0xe8c067, 0.2);
  gold.rotation.set(-0.42, 0.1, 0.78);
  group.add(gold);

  return group;
}

function smoothstep(edge0, edge1, value) {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function gentlyPoseAstronautMesh(root) {
  root.traverse((object) => {
    if (!object.isMesh || !object.geometry?.attributes?.position) return;

    const geometry = object.geometry.clone();
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i);
      const nx = (vertex.x - center.x) / Math.max(size.x * 0.5, 0.0001);
      const ny = (vertex.y - box.min.y) / Math.max(size.y, 0.0001);
      const side = Math.sign(nx) || 1;
      const absX = Math.abs(nx);

      const armMask =
        smoothstep(0.34, 0.72, absX) *
        smoothstep(0.28, 0.48, ny) *
        (1 - smoothstep(0.78, 0.94, ny));

      const handMask =
        smoothstep(0.56, 0.88, absX) *
        smoothstep(0.18, 0.34, ny) *
        (1 - smoothstep(0.62, 0.78, ny));

      const legMask =
        smoothstep(0.10, 0.34, absX) *
        smoothstep(0.02, 0.12, ny) *
        (1 - smoothstep(0.38, 0.52, ny));

      vertex.x -= side * armMask * size.x * 0.045;
      vertex.z += (armMask * 0.07 + handMask * 0.12) * size.z;
      vertex.y += handMask * size.y * 0.018;

      vertex.x -= side * legMask * size.x * 0.035;
      vertex.z += legMask * size.z * 0.08;
      vertex.y += legMask * size.y * 0.02;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    object.geometry = geometry;
  });
}

function upgradeAstronautMaterials(root, envTexture, darkMode) {
  const ownedMaterials = new Set();
  const visorColor = darkMode ? 0xbed2ff : 0xd4e3ff;
  const suitTint = new THREE.Color(darkMode ? 0xd9e7ff : 0xf8fbff);
  const goldTint = new THREE.Color(0xe7b95d);

  root.traverse((object) => {
    if (!object.isMesh) return;
    object.frustumCulled = false;
    object.castShadow = false;
    object.receiveShadow = false;

    const originalMaterials = Array.isArray(object.material) ? object.material : [object.material];
    const upgraded = originalMaterials.map((sourceMaterial) => {
      const name = `${object.name || ''} ${sourceMaterial?.name || ''}`.toLowerCase();
      const sourceColor = sourceMaterial?.color?.clone?.() || new THREE.Color(0xffffff);
      const isDarkPart = sourceColor.r + sourceColor.g + sourceColor.b < 0.55;
      const isWarmPart = sourceColor.r > sourceColor.b * 1.25 && sourceColor.g > sourceColor.b * 0.86;
      const isVisor = name.includes('visor') || name.includes('glass') || name.includes('helmet') && isDarkPart;

      let material;
      if (isVisor) {
        material = new THREE.MeshPhysicalMaterial({
          name: `${sourceMaterial?.name || object.name || 'astronaut'}-premium-visor`,
          color: visorColor,
          map: sourceMaterial?.map || null,
          normalMap: sourceMaterial?.normalMap || null,
          metalness: 0.18,
          roughness: 0.08,
          transparent: true,
          opacity: 0.72,
          clearcoat: 1,
          clearcoatRoughness: 0.045,
          envMap: envTexture,
          envMapIntensity: 2.65,
        });
      } else {
        material = sourceMaterial?.clone?.() || new THREE.MeshStandardMaterial({ color: sourceColor });
        if ('envMap' in material) material.envMap = envTexture;
        if ('envMapIntensity' in material) material.envMapIntensity = isDarkPart ? 1.95 : 1.45;
        if ('metalness' in material) material.metalness = isWarmPart ? 0.48 : Math.max(material.metalness || 0, isDarkPart ? 0.22 : 0.08);
        if ('roughness' in material) material.roughness = isWarmPart ? 0.28 : Math.min(material.roughness ?? 0.52, isDarkPart ? 0.32 : 0.42);
        if ('clearcoat' in material) material.clearcoat = isDarkPart ? 0.75 : 0.46;
        if ('clearcoatRoughness' in material) material.clearcoatRoughness = 0.12;
        if (material.color) {
          if (isWarmPart) material.color.lerp(goldTint, 0.22);
          else if (!isDarkPart) material.color.lerp(suitTint, 0.22);
        }
      }

      material.needsUpdate = true;
      ownedMaterials.add(material);
      return material;
    });

    object.material = Array.isArray(object.material) ? upgraded : upgraded[0];
  });

  return ownedMaterials;
}

function normalizeAstronautModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const scale = 1.84 / maxAxis;

  root.scale.setScalar(scale);
  root.position.set(
    -center.x * scale - 0.08,
    -center.y * scale + 0.01,
    -center.z * scale
  );
  root.userData.baseY = root.position.y;
  root.userData.baseScale = scale;
  root.userData.baseRotation = new THREE.Euler(-0.05, -0.34, -0.2);
  root.rotation.set(-0.05, -0.34, -0.2);
}

export default function HeroAstronautScene({ darkMode = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    let disposed = false;
    let frame = 0;
    let mixer = null;
    let modelRoot = null;
    let ownedModelMaterials = new Set();
    const interaction = {
      dragging: false,
      pointerId: null,
      lastX: 0,
      yaw: 0,
      targetYaw: 0,
    };

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 80);
    camera.position.set(0, 0.16, 5.45);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = darkMode ? 1.18 : 1.04;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));

    const envTexture = createStudioReflectionTexture(darkMode);
    scene.environment = envTexture;

    scene.add(new THREE.AmbientLight(darkMode ? 0xbfd6ff : 0xffffff, darkMode ? 0.42 : 0.46));

    const key = new THREE.DirectionalLight(darkMode ? 0xeaf1ff : 0xffffff, darkMode ? 3.2 : 2.8);
    key.position.set(2.8, 4.2, 5.2);
    scene.add(key);

    const rim = new THREE.DirectionalLight(darkMode ? 0x7df9ff : 0x42d9c3, darkMode ? 1.8 : 1.1);
    rim.position.set(-4, 1.6, -2.8);
    scene.add(rim);

    const warm = new THREE.PointLight(0xffd99a, darkMode ? 1.45 : 0.95, 8);
    warm.position.set(-1.8, 1.8, 2.2);
    scene.add(warm);

    const orbitGroup = createOrbitSystem(darkMode);
    scene.add(orbitGroup);

    const stars = new THREE.Points(
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

    const loader = new GLTFLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      ASTRONAUT_MODEL_URL,
      (gltf) => {
        if (disposed) return;
        modelRoot = gltf.scene;
        gentlyPoseAstronautMesh(modelRoot);
        normalizeAstronautModel(modelRoot);
        ownedModelMaterials = upgradeAstronautMaterials(modelRoot, envTexture, darkMode);
        scene.add(modelRoot);

        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(modelRoot);
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.setEffectiveTimeScale(0.7);
            action.play();
          });
        }
      },
      undefined,
      undefined
    );

    function resize() {
      const width = Math.max(1, Math.round(container.clientWidth));
      const height = Math.max(1, Math.round(container.clientHeight));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    function handlePointerDown(event) {
      interaction.dragging = true;
      interaction.pointerId = event.pointerId;
      interaction.lastX = event.clientX;
      canvas.classList.add('is-dragging');
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }

    function handlePointerMove(event) {
      if (!interaction.dragging || interaction.pointerId !== event.pointerId) return;
      const dx = event.clientX - interaction.lastX;
      interaction.lastX = event.clientX;
      interaction.targetYaw = THREE.MathUtils.clamp(interaction.targetYaw + dx * 0.0075, -1.25, 1.25);
      event.preventDefault();
    }

    function handlePointerUp(event) {
      if (interaction.pointerId !== event.pointerId) return;
      interaction.dragging = false;
      interaction.pointerId = null;
      canvas.classList.remove('is-dragging');
      canvas.releasePointerCapture?.(event.pointerId);
    }

    function handleDoubleClick() {
      interaction.targetYaw = 0;
    }

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('dblclick', handleDoubleClick);

    let previous = performance.now();
    const startedAt = previous;

    function renderFrame() {
      const now = performance.now();
      const delta = Math.min(0.033, (now - previous) / 1000);
      previous = now;
      const t = (now - startedAt) / 1000;

      if (mixer) mixer.update(delta);
      interaction.yaw = THREE.MathUtils.lerp(interaction.yaw, interaction.targetYaw, 0.12);

      if (modelRoot) {
        const baseRotation = modelRoot.userData.baseRotation;
        modelRoot.position.y = modelRoot.userData.baseY + Math.sin(t * 1.02) * 0.075;
        modelRoot.rotation.y = baseRotation.y + interaction.yaw + Math.sin(t * 0.52) * 0.12;
        modelRoot.rotation.z = baseRotation.z + Math.sin(t * 0.62) * 0.045;
        modelRoot.rotation.x = baseRotation.x + Math.sin(t * 0.44) * 0.028;
        modelRoot.scale.setScalar(modelRoot.userData.baseScale);
      }

      orbitGroup.rotation.z = t * 0.1;
      orbitGroup.rotation.y = Math.sin(t * 0.28) * 0.18;
      stars.rotation.y = t * 0.018;
      stars.rotation.z = Math.sin(t * 0.2) * 0.05;

      renderer.render(scene, camera);
      if (!reduceMotion) frame = requestAnimationFrame(renderFrame);
    }

    renderFrame();

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      const sceneMaterials = new Set();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => sceneMaterials.add(material));
      });
      ownedModelMaterials.forEach((material) => sceneMaterials.add(material));
      sceneMaterials.forEach((material) => material.dispose());
      envTexture.dispose();
      renderer.dispose();
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-astronaut-canvas"
      data-hero-astronaut-canvas
      aria-label="ACCA EDU floating 3D astronaut"
      role="img"
    />
  );
}
