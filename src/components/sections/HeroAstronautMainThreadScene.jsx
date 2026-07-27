import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { buildAstronaut } from './buildAstronaut';
import { createStudioReflectionTexture } from './astronautSceneUtils';
import { DEFAULT_ASTRONAUT_CONFIG } from '../../lib/astronautConfig';

const TAU = Math.PI * 2;

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
  group.position.set(0.02, 0.18, -0.68);

  const teal = createOrbitLine(1.32, 0.66, darkMode ? 0x82ffe4 : 0x0e9f84, darkMode ? 0.32 : 0.22);
  teal.rotation.set(0.7, 0.2, -0.24);
  group.add(teal);

  const tall = createOrbitLine(0.84, 1.22, darkMode ? 0xb7fff1 : 0x33cdb6, darkMode ? 0.22 : 0.16);
  tall.rotation.set(0.2, -0.18, 0.08);
  group.add(tall);

  const gold = createOrbitLine(1.06, 0.4, 0xe8c067, 0.18);
  gold.rotation.set(-0.42, 0.1, 0.78);
  group.add(gold);

  return group;
}

/** Human-proportioned GLB astronaut with lightweight modular customization. */
export default function HeroAstronautScene({
  darkMode = false,
  config = DEFAULT_ASTRONAUT_CONFIG,
  fallbackSrc = null,
  fallbackAlt = '',
}) {
  const canvasRef = useRef(null);
  const astronautRef = useRef(null);
  const configRef = useRef(config);
  const [webglFailed, setWebglFailed] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    configRef.current = config;
    astronautRef.current?.applyConfig(config);
  }, [config]);

  useEffect(() => {
    if (webglFailed) return undefined;
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    let disposed = false;
    let frame = 0;
    let astronaut = null;
    let modelRoot = null;
    setModelReady(false);
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

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      queueMicrotask(() => setWebglFailed(true));
      return undefined;
    }
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

    /* The signature green rim light — sweeps across the glossy helmet as the
       astronaut sways (the lighting the original was loved for). */
    const rim = new THREE.DirectionalLight(darkMode ? 0x7df9ff : 0x36d9b0, darkMode ? 2.1 : 1.5);
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

    buildAstronaut(configRef.current, { envTexture })
      .then((instance) => {
        if (disposed) {
          instance.dispose();
          return;
        }
        astronaut = instance;
        instance.applyConfig(configRef.current);
        astronautRef.current = instance;
        modelRoot = instance.group;
        scene.add(modelRoot);
        setModelReady(true);
        renderer.render(scene, camera);
      })
      .catch(() => {
        if (!disposed) setWebglFailed(true);
      });

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
      /* touch keeps its default so vertical page scrolling still works
         (CSS touch-action: pan-y hands vertical pans back to the browser) */
      if (event.pointerType === 'mouse') event.preventDefault();
    }

    function handlePointerMove(event) {
      if (!interaction.dragging || interaction.pointerId !== event.pointerId) return;
      const dx = event.clientX - interaction.lastX;
      interaction.lastX = event.clientX;
      // Horizontal drag is intentionally unbounded: visitors can inspect the
      // astronaut through full 360-degree turns without enabling pitch or zoom.
      interaction.targetYaw += dx * 0.0075;
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

      interaction.yaw = THREE.MathUtils.lerp(interaction.yaw, interaction.targetYaw, 0.12);
      astronaut?.update(t, delta);

      if (modelRoot) {
        const baseRotation = modelRoot.userData.baseRotation;
        modelRoot.position.y = modelRoot.userData.baseY + Math.sin(t * 1.02) * 0.072;
        modelRoot.rotation.y = baseRotation.y + interaction.yaw + Math.sin(t * 0.52) * 0.11;
        modelRoot.rotation.z = baseRotation.z + Math.sin(t * 0.62) * 0.04;
        modelRoot.rotation.x = baseRotation.x + Math.sin(t * 0.44) * 0.025;
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
      if (astronaut) {
        scene.remove(astronaut.group);
        astronaut.dispose();
      }
      if (astronautRef.current === astronaut) astronautRef.current = null;
      const sceneMaterials = new Set();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        const objMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objMaterials.filter(Boolean).forEach((material) => sceneMaterials.add(material));
      });
      sceneMaterials.forEach((material) => material.dispose());
      envTexture.dispose();
      renderer.dispose();
    };
  }, [darkMode, webglFailed]);

  if (webglFailed && fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={fallbackAlt}
        className="hero-mobile-astronaut"
        width="384"
        height="384"
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <>
      {!modelReady && <div className="hero-astronaut-loader" aria-hidden="true" />}
      <canvas
        ref={canvasRef}
        className={`hero-astronaut-canvas transition-opacity duration-300 ${modelReady ? 'opacity-100' : 'opacity-0'}`}
        data-hero-astronaut-canvas
        aria-label="ACCA EDU floating 3D astronaut"
        role="img"
      />
    </>
  );
}
