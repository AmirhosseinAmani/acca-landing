import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import {
  Activity,
  Atom,
  Backpack,
  Armchair,
  Box,
  Briefcase,
  Camera,
  Check,
  CircleDot,
  CircleOff,
  ClipboardCopy,
  Flag,
  Footprints,
  Gauge,
  Globe2,
  Headphones,
  Lightbulb,
  Moon,
  MousePointer2,
  Move3d,
  Orbit,
  Palette,
  Radio,
  RefreshCcw,
  Rocket,
  Save,
  Shield,
  Shuffle,
  Sparkles,
  Sun,
  Tablet,
  Trash2,
  Triangle,
  Wrench,
  X,
} from 'lucide-react';
import {
  ASTRONAUT_MODEL_URL,
  ASTRONAUT_PRODUCTION_MODEL_URL,
  buildAstronaut,
} from './buildAstronaut';
import { createStudioReflectionTexture } from './astronautSceneUtils';
import {
  ACCENT_FINISHES,
  ACCENT_COLORS,
  ASTRONAUT_PRESETS,
  CHEST_OPTIONS,
  DEFAULT_ASTRONAUT_CONFIG,
  EDITOR_MATERIALS,
  HELMET_OPTIONS,
  LOGO_OPTIONS,
  PACK_OPTIONS,
  PACK_COLORS,
  PACK_PRIMARY_COLORS,
  PACK_SHADOW_COLORS,
  POSE_OPTIONS,
  SUIT_FINISHES,
  SUIT_COLORS,
  VISOR_COLORS,
  getAstronautEditorTargetOptions,
  getAstronautEditorTargetState,
  randomAstronautConfig,
  sanitizeAstronautConfig,
  toCssHex,
} from '../../lib/astronautConfig';

const OPTION_ICONS = {
  classic: Shield,
  comms: Radio,
  explorer: Lightbulb,
  camera: Camera,
  sunshield: Sun,
  standard: Backpack,
  compact: Box,
  jetpack: Rocket,
  student: Briefcase,
  minimal: CircleOff,
  dcm: Gauge,
  terminal: Tablet,
  oxygen: Activity,
  telemetry: Radio,
  clean: CircleOff,
  acca: Sparkles,
  turkey: Flag,
  iran: Flag,
  orbit: Orbit,
  lunar: Moon,
  earth: Globe2,
  science: Atom,
  mars: CircleDot,
  none: CircleOff,
  fabric: Shield,
  polymer: Box,
  velvet: Sparkles,
  matte: Moon,
  gloss: Sun,
  titanium: CircleDot,
  metallic: Sparkles,
  float: Orbit,
  reference: Sparkles,
  drift: Move3d,
  sit: Armchair,
  walk: Footprints,
  jet: Rocket,
};

function labelFor(option, isFa) {
  return isFa ? option.fa : option.en;
}

function createEditorTransformExport({ draft, selectedTarget, selectedTargetState, transformSpace }) {
  const pose = POSE_OPTIONS.find((option) => option.id === draft.pose);
  const transform = {
    position: [...selectedTargetState.position],
    rotationDegrees: [...selectedTargetState.rotation],
    scale: [...selectedTargetState.scale],
    material: selectedTargetState.material,
  };

  return {
    schema: 'acca.astronaut-editor-transform/v1',
    pose: {
      id: draft.pose,
      fa: pose?.fa || draft.pose,
      en: pose?.en || draft.pose,
    },
    target: {
      webId: selectedTarget.id,
      fa: selectedTarget.fa,
      en: selectedTarget.en,
      materialScope: selectedTarget.materialScope,
    },
    transformSpace,
    transform,
    appearanceContext: {
      suit: draft.suit,
      suitFinish: draft.suitFinish,
      accent: draft.accent,
      accentFinish: draft.accentFinish,
      visor: draft.visor,
      helmet: draft.helmet,
      pack: draft.pack,
      packPrimary: draft.packPrimary,
      packSecondary: draft.packSecondary,
      packShadow: draft.packShadow,
      chest: draft.chest,
      chestColor: draft.chestColor,
      logo: draft.logo,
    },
    configPatch: {
      pose: draft.pose,
      editor: {
        poseTargets: {
          [draft.pose]: {
            [selectedTarget.id]: {
              position: [...transform.position],
              rotation: [...transform.rotationDegrees],
              scale: [...transform.scale],
              material: transform.material,
            },
          },
        },
      },
    },
  };
}

function roundTriangleNumber(value) {
  return Math.round(value * 100000) / 100000;
}

function resolveRequestedAstronautAsset() {
  try {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('astroModel') || window.localStorage.getItem('acca-astronaut-model');
    if (requested === 'production') {
      return { variant: 'production', url: ASTRONAUT_PRODUCTION_MODEL_URL };
    }
  } catch {
    // The default source asset is also the safe answer during SSR or restricted storage access.
  }
  return { variant: 'source', url: ASTRONAUT_MODEL_URL };
}

function createTriangleSelectionExport({ draft, selections }) {
  const pose = POSE_OPTIONS.find((option) => option.id === draft.pose);
  return {
    schema: 'acca.astronaut-triangle-selection/v1',
    asset: resolveRequestedAstronautAsset(),
    pose: {
      id: draft.pose,
      fa: pose?.fa || draft.pose,
      en: pose?.en || draft.pose,
    },
    selection: {
      primitive: 'triangle',
      count: selections.length,
      triangles: selections,
    },
    appearanceContext: {
      suit: draft.suit,
      suitFinish: draft.suitFinish,
      accent: draft.accent,
      accentFinish: draft.accentFinish,
      visor: draft.visor,
      helmet: draft.helmet,
      pack: draft.pack,
      packPrimary: draft.packPrimary,
      packSecondary: draft.packSecondary,
      packShadow: draft.packShadow,
      chest: draft.chest,
      chestColor: draft.chestColor,
      logo: draft.logo,
    },
  };
}

async function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for browsers that expose Clipboard API without write permission.
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.inset = '0 auto auto -9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    if (!document.execCommand('copy')) throw new Error('Clipboard copy failed');
  } finally {
    textArea.remove();
  }
}

function AstronautPreviewCanvas({
  config,
  darkMode,
  editorActive = false,
  selectedTargetId = 'edit.character',
  transformMode = 'translate',
  transformSpace = 'local',
  snapEnabled = false,
  triangleSelectionActive = false,
  triangleSelectionClearToken = 0,
  onSelectTarget,
  onTransformChange,
  onTriangleSelectionChange,
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const configRef = useRef(config);
  const editorRef = useRef({
    editorActive,
    selectedTargetId,
    transformMode,
    transformSpace,
    snapEnabled,
    triangleSelectionActive,
    triangleSelectionClearToken,
    onSelectTarget,
    onTransformChange,
    onTriangleSelectionChange,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    configRef.current = config;
    stageRef.current?.astronaut?.applyConfig(config);
    stageRef.current?.syncEditor?.();
  }, [config]);

  useEffect(() => {
    editorRef.current = {
      editorActive,
      selectedTargetId,
      transformMode,
      transformSpace,
      snapEnabled,
      triangleSelectionActive,
      triangleSelectionClearToken,
      onSelectTarget,
      onTransformChange,
      onTriangleSelectionChange,
    };
    stageRef.current?.syncEditor?.();
  }, [
    editorActive,
    onSelectTarget,
    onTransformChange,
    onTriangleSelectionChange,
    selectedTargetId,
    snapEnabled,
    transformMode,
    transformSpace,
    triangleSelectionActive,
    triangleSelectionClearToken,
  ]);

  useEffect(() => {
    stageRef.current?.clearTriangleSelection?.(triangleSelectionClearToken);
  }, [triangleSelectionClearToken]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    let disposed = false;
    let frame = 0;
    let astronaut = null;
    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return undefined;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = darkMode ? 1.28 : 1.04;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 40);
    camera.position.set(0, 0.12, 4.45);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const envTexture = createStudioReflectionTexture(darkMode);
    scene.environment = envTexture;
    scene.add(new THREE.AmbientLight(darkMode ? 0xc8dcff : 0xffffff, darkMode ? 0.72 : 0.54));

    const key = new THREE.DirectionalLight(0xffffff, darkMode ? 3.45 : 2.7);
    key.position.set(2.7, 4.2, 5.2);
    scene.add(key);

    const rim = new THREE.DirectionalLight(darkMode ? 0x8bfce8 : 0x2ed0ae, darkMode ? 2.15 : 1.65);
    rim.position.set(-3.8, 1.6, -2.6);
    scene.add(rim);

    const warm = new THREE.PointLight(0xffd7a0, darkMode ? 1.25 : 0.85, 7);
    warm.position.set(-1.4, 1.8, 2.2);
    scene.add(warm);

    const grid = new THREE.GridHelper(3.3, 18, darkMode ? 0x2ed0ae : 0x0e8c74, darkMode ? 0x33445d : 0xb8c8c4);
    grid.position.y = -1.02;
    grid.material.transparent = true;
    grid.material.opacity = darkMode ? 0.28 : 0.2;
    grid.visible = false;
    scene.add(grid);

    const selectionBounds = new THREE.Box3();
    const selectionBox = new THREE.Box3Helper(selectionBounds, darkMode ? 0x7df9ff : 0x058a70);
    selectionBox.visible = false;
    scene.add(selectionBox);

    const triangleOverlayRoot = new THREE.Group();
    triangleOverlayRoot.name = 'Astronaut triangle selection overlay';
    scene.add(triangleOverlayRoot);
    const triangleSelections = new Map();
    const triangleVertex = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

    const transformControls = new TransformControls(camera, canvas);
    const transformHelper = transformControls.getHelper();
    transformHelper.visible = false;
    transformControls.setSize(0.78);
    scene.add(transformHelper);

    const stage = {
      astronaut: null,
      dragging: false,
      pointerId: null,
      lastX: 0,
      pointerStartX: 0,
      pointerStartY: 0,
      pointerMoved: false,
      yaw: 0,
      targetYaw: 0,
      transformDragging: false,
      currentTime: 0,
      triangleSelectionTime: 0,
      triangleSelectionModeActive: false,
      syncEditor: null,
      clearTriangleSelection: null,
      lastTriangleClearToken: -1,
    };
    stageRef.current = stage;

    function getTriangleVertexIndices(object, triangleIndex) {
      const geometry = object.geometry;
      const index = geometry?.getIndex?.();
      const first = triangleIndex * 3;
      if (index) return [index.getX(first), index.getX(first + 1), index.getX(first + 2)];
      return [first, first + 1, first + 2];
    }

    function readLocalVertex(object, vertexIndex, target, posed = false) {
      if (posed && typeof object.getVertexPosition === 'function') {
        object.getVertexPosition(vertexIndex, target);
        return target;
      }
      return target.fromBufferAttribute(object.geometry.getAttribute('position'), vertexIndex);
    }

    function vectorArray(vector) {
      return [
        roundTriangleNumber(vector.x),
        roundTriangleNumber(vector.y),
        roundTriangleNumber(vector.z),
      ];
    }

    function updateTriangleOverlay(entry) {
      const { object, vertexIndices, fillGeometry, edgeGeometry } = entry;
      if (!object?.parent) return;
      object.updateWorldMatrix(true, false);
      object.skeleton?.update?.();
      const fillPositions = fillGeometry.getAttribute('position');
      const edgePositions = edgeGeometry.getAttribute('position');
      vertexIndices.forEach((vertexIndex, index) => {
        readLocalVertex(object, vertexIndex, triangleVertex[index], true);
        object.localToWorld(triangleVertex[index]);
        fillPositions.setXYZ(index, triangleVertex[index].x, triangleVertex[index].y, triangleVertex[index].z);
        edgePositions.setXYZ(index, triangleVertex[index].x, triangleVertex[index].y, triangleVertex[index].z);
      });
      fillPositions.needsUpdate = true;
      edgePositions.needsUpdate = true;
    }

    function disposeTriangleEntry(entry) {
      triangleOverlayRoot.remove(entry.fill, entry.edge);
      entry.fillGeometry.dispose();
      entry.edgeGeometry.dispose();
      entry.fill.material.dispose();
      entry.edge.material.dispose();
    }

    function emitTriangleSelection() {
      editorRef.current.onTriangleSelectionChange?.(
        Array.from(triangleSelections.values(), (entry) => entry.payload)
      );
    }

    function clearTriangleSelection(clearToken) {
      if (clearToken !== undefined && clearToken === stage.lastTriangleClearToken) return;
      if (clearToken !== undefined) stage.lastTriangleClearToken = clearToken;
      triangleSelections.forEach(disposeTriangleEntry);
      triangleSelections.clear();
      emitTriangleSelection();
    }
    stage.clearTriangleSelection = clearTriangleSelection;

    function syncEditor() {
      const editor = editorRef.current;
      const triangleMode = editor.editorActive && editor.triangleSelectionActive;
      if (triangleMode && !stage.triangleSelectionModeActive) {
        stage.triangleSelectionTime = stage.currentTime;
      }
      stage.triangleSelectionModeActive = triangleMode;
      transformControls.enabled = editor.editorActive && !triangleMode;
      transformControls.setMode(editor.transformMode);
      transformControls.setSpace(editor.transformSpace);
      transformControls.setTranslationSnap(editor.snapEnabled ? 0.025 : null);
      transformControls.setRotationSnap(editor.snapEnabled ? THREE.MathUtils.degToRad(15) : null);
      transformControls.setScaleSnap(editor.snapEnabled ? 0.1 : null);
      grid.visible = editor.editorActive;
      const target = stage.astronaut?.getEditorTarget(editor.selectedTargetId);
      if (editor.editorActive && !triangleMode && target) {
        transformControls.attach(target);
        transformHelper.visible = true;
        selectionBox.visible = true;
      } else {
        transformControls.detach();
        transformHelper.visible = false;
        selectionBox.visible = false;
      }
    }
    stage.syncEditor = syncEditor;

    function onTransformDragging(event) {
      stage.transformDragging = event.value;
      if (event.value) stage.dragging = false;
    }

    function onTransformObjectChange() {
      const id = editorRef.current.selectedTargetId;
      const next = stage.astronaut?.captureEditorTransform(id);
      if (next) editorRef.current.onTransformChange?.(id, next);
    }

    transformControls.addEventListener('dragging-changed', onTransformDragging);
    transformControls.addEventListener('objectChange', onTransformObjectChange);

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

    function onPointerDown(event) {
      if (stage.transformDragging) return;
      stage.dragging = true;
      stage.pointerId = event.pointerId;
      stage.lastX = event.clientX;
      stage.pointerStartX = event.clientX;
      stage.pointerStartY = event.clientY;
      stage.pointerMoved = false;
      canvas.setPointerCapture?.(event.pointerId);
      if (event.pointerType === 'mouse') event.preventDefault();
    }

    function onPointerMove(event) {
      if (!stage.dragging || stage.pointerId !== event.pointerId) return;
      const moved = Math.hypot(event.clientX - stage.pointerStartX, event.clientY - stage.pointerStartY);
      stage.pointerMoved = stage.pointerMoved || moved > 4;
      if (!editorRef.current.triangleSelectionActive) {
        stage.targetYaw += (event.clientX - stage.lastX) * 0.009;
      }
      stage.lastX = event.clientX;
    }

    function selectAt(event) {
      if (!stage.astronaut) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObject(stage.astronaut.group, true);
      for (const intersection of intersections) {
        const id = stage.astronaut.findEditorTarget(intersection.object);
        if (!id) continue;
        editorRef.current.onSelectTarget?.(id);
        return;
      }
    }

    function selectTriangleAt(event) {
      if (!stage.astronaut) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster
        .intersectObject(stage.astronaut.group, true)
        .find((hit) => hit.object?.isMesh && Number.isInteger(hit.faceIndex));
      if (!intersection) return;

      const object = intersection.object;
      const geometry = object.geometry;
      const position = geometry?.getAttribute?.('position');
      if (!position) return;
      const triangleIndex = intersection.faceIndex;
      const key = `${object.uuid}:${triangleIndex}`;
      const existing = triangleSelections.get(key);
      if (existing) {
        disposeTriangleEntry(existing);
        triangleSelections.delete(key);
        emitTriangleSelection();
        return;
      }

      const vertexIndices = getTriangleVertexIndices(object, triangleIndex);
      if (vertexIndices.some((index) => index < 0 || index >= position.count)) return;
      object.updateWorldMatrix(true, false);
      object.skeleton?.update?.();
      const geometryLocal = [];
      const posedLocal = [];
      const world = [];
      vertexIndices.forEach((vertexIndex) => {
        const base = readLocalVertex(object, vertexIndex, new THREE.Vector3());
        geometryLocal.push(vectorArray(base));
        const posed = readLocalVertex(object, vertexIndex, new THREE.Vector3(), true);
        posedLocal.push(vectorArray(posed));
        world.push(vectorArray(object.localToWorld(posed.clone())));
      });

      const fillGeometry = new THREE.BufferGeometry();
      fillGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(9), 3));
      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(9), 3));
      const fill = new THREE.Mesh(fillGeometry, new THREE.MeshBasicMaterial({
        color: 0xff4f3d,
        depthTest: false,
        depthWrite: false,
        opacity: 0.62,
        side: THREE.DoubleSide,
        toneMapped: false,
        transparent: true,
      }));
      const edge = new THREE.LineLoop(edgeGeometry, new THREE.LineBasicMaterial({
        color: 0xffe36e,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }));
      fill.frustumCulled = false;
      edge.frustumCulled = false;
      fill.renderOrder = 1000;
      edge.renderOrder = 1001;
      triangleOverlayRoot.add(fill, edge);

      const meshTargetId = stage.astronaut.findEditorTarget(object);
      const index = geometry.getIndex();
      const entry = {
        object,
        vertexIndices,
        fill,
        edge,
        fillGeometry,
        edgeGeometry,
        payload: {
          mesh: {
            webId: object.userData.web_id || meshTargetId || null,
            editorTargetId: meshTargetId || null,
            name: object.name || null,
            indexed: Boolean(index),
            positionCount: position.count,
            indexCount: index?.count || 0,
            triangleCount: Math.floor((index?.count || position.count) / 3),
          },
          triangleIndex,
          vertexIndices,
          vertices: { geometryLocal, posedLocal, world },
          hitPointWorld: vectorArray(intersection.point),
        },
      };
      triangleSelections.set(key, entry);
      updateTriangleOverlay(entry);
      emitTriangleSelection();
    }

    function onPointerUp(event) {
      if (stage.pointerId !== event.pointerId) return;
      if (editorRef.current.editorActive && !stage.pointerMoved && !stage.transformDragging) {
        if (editorRef.current.triangleSelectionActive) selectTriangleAt(event);
        else selectAt(event);
      }
      stage.dragging = false;
      stage.pointerId = null;
      canvas.releasePointerCapture?.(event.pointerId);
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    buildAstronaut(configRef.current, { envTexture })
      .then((instance) => {
        if (disposed) {
          instance.dispose();
          return;
        }
        astronaut = instance;
        instance.applyConfig(configRef.current);
        stage.astronaut = instance;
        scene.add(instance.group);
        syncEditor();
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setReady(false);
      });

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let previous = performance.now();
    const startedAt = previous;

    function renderFrame() {
      const now = performance.now();
      const delta = Math.min(0.033, (now - previous) / 1000);
      previous = now;
      const time = (now - startedAt) / 1000;
      stage.currentTime = time;

      if (!stage.dragging && !reduceMotion && !editorRef.current.editorActive) stage.targetYaw += delta * 0.16;
      stage.yaw = THREE.MathUtils.lerp(stage.yaw, stage.targetYaw, 0.12);

      if (astronaut) {
        const triangleMode = editorRef.current.editorActive && editorRef.current.triangleSelectionActive;
        const previewTime = triangleMode ? stage.triangleSelectionTime : time;
        astronaut.update(previewTime, delta);
        const model = astronaut.group;
        const baseRotation = model.userData.baseRotation;
        model.rotation.y = baseRotation.y + stage.yaw;
        model.rotation.x = baseRotation.x;
        model.rotation.z = baseRotation.z;
        model.position.y = model.userData.baseY + (reduceMotion || triangleMode ? 0 : Math.sin(time * 0.9) * 0.035);
        const target = astronaut.getEditorTarget(editorRef.current.selectedTargetId);
        if (editorRef.current.editorActive && !editorRef.current.triangleSelectionActive && target) {
          selectionBounds.setFromObject(target);
          selectionBox.visible = !selectionBounds.isEmpty();
        }
        triangleSelections.forEach(updateTriangleOverlay);
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(renderFrame);
    }

    renderFrame();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      transformControls.removeEventListener('dragging-changed', onTransformDragging);
      transformControls.removeEventListener('objectChange', onTransformObjectChange);
      transformControls.detach();
      transformControls.dispose();
      triangleSelections.forEach(disposeTriangleEntry);
      triangleSelections.clear();
      scene.remove(triangleOverlayRoot);
      if (astronaut) {
        scene.remove(astronaut.group);
        astronaut.dispose();
      }
      if (stageRef.current === stage) stageRef.current = null;
      envTexture.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      selectionBox.geometry.dispose();
      selectionBox.material.dispose();
      renderer.dispose();
    };
  }, [darkMode]);

  return (
    <div className="relative h-full min-h-0 w-full">
      {!ready && (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <span className={`h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-emerald-500 ${darkMode ? 'border-r-white/30' : 'border-r-[#071a3d]/20'}`} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`block h-full w-full select-none touch-pan-y transition-opacity duration-300 ${triangleSelectionActive ? 'cursor-cell' : editorActive ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'} ${ready ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Astronaut preview"
        role="img"
      />
    </div>
  );
}

function Swatches({ options, value, onChange, darkMode, isFa }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const selected = value === option.id;
        const label = labelFor(option, isFa);
        return (
          <button
            key={option.id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`relative h-10 w-10 rounded-full border transition-transform duration-150 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${selected ? 'scale-105 border-emerald-500 ring-2 ring-emerald-500/35' : darkMode ? 'border-white/20' : 'border-black/15'}`}
            style={{ backgroundColor: toCssHex(option.hex) }}
          >
            {selected && (
              <Check className={`absolute inset-0 m-auto h-4 w-4 ${option.id === 'eva' || option.id === 'pearl' || option.id === 'lunar' || option.id === 'ice' ? 'text-[#071a3d]' : 'text-white'}`} strokeWidth={3} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function OptionGrid({ options, value, onChange, darkMode, isFa }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.id;
        const Icon = OPTION_ICONS[option.id] || Sparkles;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`relative flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${selected ? darkMode ? 'border-emerald-400 bg-emerald-400/12 text-emerald-200' : 'border-emerald-600 bg-emerald-50 text-[#075f4b]' : darkMode ? 'border-white/10 bg-white/[0.045] text-white/70 hover:bg-white/[0.075]' : 'border-[#071a3d]/10 bg-white text-[#071a3d]/65 hover:bg-[#f5f8f7]'}`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-[11px] font-bold leading-4">{labelFor(option, isFa)}</span>
            {selected && <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children, darkMode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className={`mb-3 text-xs font-black ${darkMode ? 'text-white/62' : 'text-[#071a3d]/58'}`}>{title}</h3>
      {children}
    </section>
  );
}

function EditorAxisFields({ mode, state, onChange, darkMode, isFa }) {
  const settings = mode === 'translate'
    ? { key: 'position', min: -1.25, max: 1.25, step: 0.01, suffix: '' }
    : mode === 'rotate'
      ? { key: 'rotation', min: -180, max: 180, step: 1, suffix: '°' }
      : { key: 'scale', min: 0.2, max: 3, step: 0.05, suffix: '×' };
  const values = state[settings.key];
  const axes = [
    { id: 'X', color: 'text-rose-500' },
    { id: 'Y', color: 'text-emerald-500' },
    { id: 'Z', color: 'text-blue-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2" dir="ltr">
      {axes.map((axis, index) => (
        <label key={axis.id} className={`rounded-lg border p-2 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-[#071a3d]/10 bg-white'}`}>
          <span className={`mb-1 block text-[10px] font-black ${axis.color}`}>{axis.id}</span>
          <span className="flex items-center gap-1">
            <input
              type="number"
              min={settings.min}
              max={settings.max}
              step={settings.step}
              value={values[index]}
              aria-label={`${isFa ? 'محور' : 'Axis'} ${axis.id}`}
              onChange={(event) => {
                const number = Number(event.target.value);
                if (!Number.isFinite(number)) return;
                const next = [...values];
                next[index] = Math.min(settings.max, Math.max(settings.min, number));
                onChange({ [settings.key]: next });
              }}
              className={`min-w-0 w-full bg-transparent text-center text-xs font-black outline-none ${darkMode ? 'text-white' : 'text-[#071a3d]'}`}
            />
            <span className={`text-[9px] ${darkMode ? 'text-white/35' : 'text-[#071a3d]/35'}`}>{settings.suffix}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function EditorMaterialGrid({ value, onChange, darkMode, isFa }) {
  const options = [
    { id: 'default', hex: 0xebece7, fa: 'متریال اصلی', en: 'Original material' },
    ...EDITOR_MATERIALS,
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 text-start transition-colors ${selected ? darkMode ? 'border-emerald-400 bg-emerald-400/12 text-emerald-100' : 'border-emerald-600 bg-emerald-50 text-emerald-900' : darkMode ? 'border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.075]' : 'border-[#071a3d]/10 bg-white text-[#071a3d]/68 hover:bg-[#f4f7f6]'}`}
          >
            <span
              className="relative h-7 w-7 shrink-0 rounded-md border border-black/10"
              style={{ backgroundColor: toCssHex(option.hex) }}
            >
              {selected && <Check className={`absolute inset-0 m-auto h-3.5 w-3.5 ${option.id === 'diamond' || option.id === 'ceramic' || option.id === 'silver' || option.id === 'default' ? 'text-[#071a3d]' : 'text-white'}`} strokeWidth={3} />}
            </span>
            <span className="text-[10px] font-black leading-4">{labelFor(option, isFa)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AstronautCustomizerModal({
  open,
  onClose,
  onSave,
  config = DEFAULT_ASTRONAUT_CONFIG,
  darkMode = false,
  isFa = true,
}) {
  const [draft, setDraft] = useState(() => sanitizeAstronautConfig(config));
  const [activeTab, setActiveTab] = useState('style');
  const [selectedTargetId, setSelectedTargetId] = useState('edit.character');
  const [transformMode, setTransformMode] = useState('translate');
  const [transformSpace, setTransformSpace] = useState('local');
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [triangleSelectionActive, setTriangleSelectionActive] = useState(false);
  const [triangleSelectionClearToken, setTriangleSelectionClearToken] = useState(0);
  const [selectedTriangles, setSelectedTriangles] = useState([]);
  const [copyResult, setCopyResult] = useState({ status: 'idle', payload: '' });
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => {
      setDraft(sanitizeAstronautConfig(config));
      setActiveTab((current) => current === 'action' ? 'mission' : current);
      setTriangleSelectionActive(false);
      setSelectedTriangles([]);
      setCopyResult({ status: 'idle', payload: '' });
      closeButtonRef.current?.focus();
    });

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, config, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const setValue = (key) => (value) => {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === 'pose' && value === 'jet') next.pack = 'jetpack';
      return sanitizeAstronautConfig(next);
    });
  };

  const editorTargetOptions = getAstronautEditorTargetOptions(draft);
  const selectedTarget = editorTargetOptions.find((target) => target.id === selectedTargetId)
    || editorTargetOptions[0];
  const selectedTargetState = getAstronautEditorTargetState(draft, selectedTarget?.id);
  const selectedTargetExportText = selectedTarget
    ? JSON.stringify(createEditorTransformExport({
      draft,
      selectedTarget,
      selectedTargetState,
      transformSpace,
    }), null, 2)
    : '';
  const selectedTrianglesExportText = selectedTriangles.length > 0
    ? JSON.stringify(createTriangleSelectionExport({ draft, selections: selectedTriangles }), null, 2)
    : '';
  const copyStatus = copyResult.payload === selectedTargetExportText
    ? copyResult.status
    : 'idle';
  const triangleCopyStatus = copyResult.payload === selectedTrianglesExportText
    ? copyResult.status
    : 'idle';

  const updateEditorTarget = (id, patch) => {
    setDraft((current) => {
      const existing = getAstronautEditorTargetState(current, id);
      const nextState = {
        position: [...existing.position],
        rotation: [...existing.rotation],
        scale: [...existing.scale],
        material: existing.material,
        ...patch,
      };
      return sanitizeAstronautConfig({
        ...current,
        editor: {
          targets: { ...(current.editor?.targets || {}) },
          poseTargets: {
            ...(current.editor?.poseTargets || {}),
            [current.pose]: {
              ...(current.editor?.poseTargets?.[current.pose] || {}),
              [id]: nextState,
            },
          },
        },
      });
    });
  };

  const resetEditorTarget = (id) => {
    setDraft((current) => {
      const targets = { ...(current.editor?.targets || {}) };
      const poseTargets = { ...(current.editor?.poseTargets || {}) };
      const currentPoseTargets = { ...(poseTargets[current.pose] || {}) };
      delete targets[id];
      delete currentPoseTargets[id];
      if (Object.keys(currentPoseTargets).length > 0) poseTargets[current.pose] = currentPoseTargets;
      else delete poseTargets[current.pose];
      return sanitizeAstronautConfig({ ...current, editor: { targets, poseTargets } });
    });
  };

  const copySelectedTargetTransform = async () => {
    if (!selectedTargetExportText) return;
    setCopyResult({ status: 'copying', payload: selectedTargetExportText });
    try {
      await copyTextToClipboard(selectedTargetExportText);
      setCopyResult({ status: 'success', payload: selectedTargetExportText });
    } catch {
      setCopyResult({ status: 'error', payload: selectedTargetExportText });
    }
  };

  const copySelectedTriangles = async () => {
    if (!selectedTrianglesExportText) return;
    setCopyResult({ status: 'copying', payload: selectedTrianglesExportText });
    try {
      await copyTextToClipboard(selectedTrianglesExportText);
      setCopyResult({ status: 'success', payload: selectedTrianglesExportText });
    } catch {
      setCopyResult({ status: 'error', payload: selectedTrianglesExportText });
    }
  };

  const clearSelectedTriangles = () => {
    setSelectedTriangles([]);
    setCopyResult({ status: 'idle', payload: '' });
    setTriangleSelectionClearToken((token) => token + 1);
  };

  const tabs = [
    { id: 'style', fa: 'استایل', en: 'Style', icon: Palette },
    { id: 'helmet', fa: 'کلاه', en: 'Helmet', icon: Headphones },
    { id: 'gear', fa: 'تجهیزات', en: 'Gear', icon: Backpack },
    { id: 'mission', fa: 'مأموریت و حرکت', en: 'Mission & motion', icon: Flag },
    { id: 'editor', fa: 'ادیتور', en: 'Editor', icon: Wrench },
  ];

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#020918]/70 p-3 backdrop-blur-md sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="astronaut-customizer-title"
        dir={isFa ? 'rtl' : 'ltr'}
        className={`flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${darkMode ? 'border-white/15 bg-[#07152f] text-white' : 'border-white/80 bg-[#f7f8f6] text-[#071a3d]'}`}
      >
        <header className={`flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5 ${darkMode ? 'border-white/10' : 'border-[#071a3d]/10'}`}>
          <div className="flex items-center gap-3">
            <span className={`grid h-9 w-9 place-items-center rounded-full ${darkMode ? 'bg-emerald-400/12 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 id="astronaut-customizer-title" className="text-sm font-black sm:text-base">
                {isFa ? 'استودیوی فضانورد آکاکو' : 'ACCA astronaut studio'}
              </h2>
              <p className={`mt-0.5 text-[10px] font-bold ${darkMode ? 'text-white/45' : 'text-[#071a3d]/46'}`}>
                {isFa ? 'نسخه مأموریت خودت را بساز' : 'Build your mission edition'}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={isFa ? 'بستن' : 'Close'}
            title={isFa ? 'بستن' : 'Close'}
            onClick={onClose}
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${darkMode ? 'bg-white/8 hover:bg-white/14' : 'bg-[#071a3d]/6 hover:bg-[#071a3d]/10'}`}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">
          <div className={`relative min-h-[230px] overflow-hidden border-b md:min-h-0 md:border-b-0 ${isFa ? 'md:border-l' : 'md:border-r'} ${darkMode ? 'border-white/10 bg-[#081934]' : 'border-[#071a3d]/10 bg-[#edf3f1]'}`}>
            <div className={`pointer-events-none absolute inset-6 rounded-full blur-3xl ${darkMode ? 'bg-emerald-400/10' : 'bg-emerald-400/14'}`} />
            <AstronautPreviewCanvas
              config={draft}
              darkMode={darkMode}
              editorActive={activeTab === 'editor'}
              selectedTargetId={selectedTarget?.id || 'edit.character'}
              transformMode={transformMode}
              transformSpace={transformSpace}
              snapEnabled={snapEnabled}
              triangleSelectionActive={activeTab === 'editor' && triangleSelectionActive}
              triangleSelectionClearToken={triangleSelectionClearToken}
              onSelectTarget={(id) => {
                if (editorTargetOptions.some((target) => target.id === id)) setSelectedTargetId(id);
              }}
              onTransformChange={updateEditorTarget}
              onTriangleSelectionChange={setSelectedTriangles}
            />
          </div>

          <div className="flex min-h-0 flex-col">
            <nav className={`grid shrink-0 grid-cols-5 border-b ${darkMode ? 'border-white/10' : 'border-[#071a3d]/10'}`} aria-label={isFa ? 'دسته‌های شخصی‌سازی' : 'Customization categories'}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== 'editor') setTriangleSelectionActive(false);
                    }}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 border-b-2 px-1 text-[10px] font-black transition-colors sm:flex-row sm:gap-2 sm:text-xs ${selected ? 'border-emerald-500 text-emerald-600' : darkMode ? 'border-transparent text-white/48 hover:text-white/75' : 'border-transparent text-[#071a3d]/48 hover:text-[#071a3d]/75'}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{isFa ? tab.fa : tab.en}</span>
                  </button>
                );
              })}
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
              {activeTab === 'style' && (
                <>
                  <Section title={isFa ? 'نسخه‌های آماده' : 'Mission presets'} darkMode={darkMode}>
                    <div className="grid grid-cols-2 gap-2">
                      {ASTRONAUT_PRESETS.map((preset) => {
                        const selected = Object.entries(preset.config).every(([key, value]) => key === 'v' || key === 'editor' || draft[key] === value);
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setDraft(sanitizeAstronautConfig(preset.config))}
                            className={`flex min-h-12 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start text-[11px] font-black transition-colors ${selected ? darkMode ? 'border-emerald-400 bg-emerald-400/12 text-emerald-200' : 'border-emerald-600 bg-emerald-50 text-emerald-800' : darkMode ? 'border-white/10 bg-white/[0.045] hover:bg-white/[0.075]' : 'border-[#071a3d]/10 bg-white hover:bg-[#f3f6f5]'}`}
                          >
                            <span>{labelFor(preset, isFa)}</span>
                            <span className="flex shrink-0 gap-1">
                              <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: toCssHex(SUIT_COLORS.find((item) => item.id === preset.config.suit)?.hex ?? 0xffffff) }} />
                              <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: toCssHex(ACCENT_COLORS.find((item) => item.id === preset.config.accent)?.hex ?? 0x10a47f) }} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                  <Section title={isFa ? 'رنگ لباس' : 'Suit color'} darkMode={darkMode}>
                    <Swatches options={SUIT_COLORS} value={draft.suit} onChange={setValue('suit')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'جنس و پرداخت لباس' : 'Suit material'} darkMode={darkMode}>
                    <OptionGrid options={SUIT_FINISHES} value={draft.suitFinish} onChange={setValue('suitFinish')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'رنگ جزئیات' : 'Mission accent'} darkMode={darkMode}>
                    <Swatches options={ACCENT_COLORS} value={draft.accent} onChange={setValue('accent')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'پرداخت جزئیات' : 'Accent finish'} darkMode={darkMode}>
                    <OptionGrid options={ACCENT_FINISHES} value={draft.accentFinish} onChange={setValue('accentFinish')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                </>
              )}

              {activeTab === 'helmet' && (
                <>
                  <Section title={isFa ? 'تجهیزات کلاه' : 'Helmet equipment'} darkMode={darkMode}>
                    <OptionGrid options={HELMET_OPTIONS} value={draft.helmet} onChange={setValue('helmet')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'شیشه محافظ' : 'Visor finish'} darkMode={darkMode}>
                    <Swatches options={VISOR_COLORS} value={draft.visor} onChange={setValue('visor')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                </>
              )}

              {activeTab === 'gear' && (
                <>
                  <Section title={isFa ? 'سامانه پشتیبانی حیات' : 'Life-support pack'} darkMode={darkMode}>
                    <OptionGrid options={PACK_OPTIONS} value={draft.pack} onChange={setValue('pack')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'رنگ اصلی کوله' : 'Pack primary color'} darkMode={darkMode}>
                    <Swatches options={PACK_PRIMARY_COLORS} value={draft.packPrimary} onChange={setValue('packPrimary')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'رنگ پنل‌ها و جزئیات کوله' : 'Pack panel color'} darkMode={darkMode}>
                    <Swatches options={PACK_COLORS} value={draft.packSecondary} onChange={setValue('packSecondary')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'رنگ سایه و عمق کوله' : 'Pack shadow color'} darkMode={darkMode}>
                    <Swatches options={PACK_SHADOW_COLORS} value={draft.packShadow} onChange={setValue('packShadow')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'ماژول روی سینه' : 'Chest module'} darkMode={darkMode}>
                    <OptionGrid options={CHEST_OPTIONS} value={draft.chest} onChange={setValue('chest')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  {draft.chest !== 'clean' && (
                    <Section title={isFa ? 'رنگ بدنه ماژول سینه' : 'Chest module body color'} darkMode={darkMode}>
                      <Swatches options={PACK_COLORS} value={draft.chestColor} onChange={setValue('chestColor')} darkMode={darkMode} isFa={isFa} />
                    </Section>
                  )}
                </>
              )}

              {activeTab === 'mission' && (
                <>
                  <Section title={isFa ? 'نشان مأموریت' : 'Mission patch'} darkMode={darkMode}>
                    <OptionGrid options={LOGO_OPTIONS} value={draft.logo} onChange={setValue('logo')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                  <Section title={isFa ? 'حرکت شخصیت' : 'Character motion'} darkMode={darkMode}>
                    <OptionGrid options={POSE_OPTIONS} value={draft.pose} onChange={setValue('pose')} darkMode={darkMode} isFa={isFa} />
                  </Section>
                </>
              )}

              {activeTab === 'editor' && selectedTarget && (
                <>
                  <Section title={isFa ? 'انتخاب دقیق سطح' : 'Precise surface selection'} darkMode={darkMode}>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
                      <button
                        type="button"
                        aria-pressed={triangleSelectionActive}
                        title={triangleSelectionActive
                          ? (isFa ? 'پایان انتخاب مثلث و بازگشت به ترنسفورم' : 'Finish triangle selection and return to transforms')
                          : (isFa ? 'انتخاب مستقیم مثلث‌های مدل' : 'Select model triangles directly')}
                        onClick={() => setTriangleSelectionActive((active) => !active)}
                        className={`flex h-11 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-black transition-colors ${triangleSelectionActive ? 'border-amber-400 bg-amber-400 text-[#071a3d]' : darkMode ? 'border-white/12 bg-white/[0.05] text-white/75 hover:bg-white/[0.09]' : 'border-[#071a3d]/12 bg-white text-[#071a3d]/72 hover:bg-[#f0f4f3]'}`}
                      >
                        <MousePointer2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">{isFa ? 'انتخاب مثلث' : 'Triangle select'}</span>
                        <span className={`flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] ${triangleSelectionActive ? 'bg-[#071a3d]/10' : darkMode ? 'bg-white/8' : 'bg-[#071a3d]/6'}`}>
                          <Triangle className="h-3 w-3" />
                          {selectedTriangles.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        title={isFa ? 'کپی کد مثلث‌های انتخاب‌شده' : 'Copy selected triangle code'}
                        aria-label={isFa ? 'کپی کد مثلث‌های انتخاب‌شده' : 'Copy selected triangle code'}
                        disabled={selectedTriangles.length === 0 || triangleCopyStatus === 'copying'}
                        onClick={copySelectedTriangles}
                        className={`grid h-11 w-11 place-items-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${triangleCopyStatus === 'success' ? darkMode ? 'border-emerald-400/60 bg-emerald-400/12 text-emerald-200' : 'border-emerald-600 bg-emerald-50 text-emerald-800' : triangleCopyStatus === 'error' ? 'border-rose-500 bg-rose-50 text-rose-700' : darkMode ? 'border-white/12 bg-white/[0.05] text-white/75 hover:bg-white/[0.09]' : 'border-[#071a3d]/12 bg-white text-[#071a3d]/72 hover:bg-[#f0f4f3]'}`}
                      >
                        {triangleCopyStatus === 'success' ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        title={isFa ? 'پاک کردن انتخاب مثلث‌ها' : 'Clear triangle selection'}
                        aria-label={isFa ? 'پاک کردن انتخاب مثلث‌ها' : 'Clear triangle selection'}
                        disabled={selectedTriangles.length === 0}
                        onClick={clearSelectedTriangles}
                        className={`grid h-11 w-11 place-items-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${darkMode ? 'border-white/12 bg-white/[0.05] text-white/65 hover:bg-white/[0.09]' : 'border-[#071a3d]/12 bg-white text-[#071a3d]/65 hover:bg-[#f0f4f3]'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="sr-only" aria-live="polite">
                      {triangleCopyStatus === 'success'
                        ? (isFa ? 'کد مثلث‌ها کپی شد' : 'Triangle code copied')
                        : triangleCopyStatus === 'error'
                          ? (isFa ? 'کپی کد مثلث‌ها ناموفق بود' : 'Triangle copy failed')
                          : ''}
                    </span>
                  </Section>

                  <Section title={isFa ? 'هدف ویرایش' : 'Edit target'} darkMode={darkMode}>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTarget.id}
                        onChange={(event) => setSelectedTargetId(event.target.value)}
                        aria-label={isFa ? 'انتخاب بخش فضانورد' : 'Select astronaut part'}
                        className={`h-11 min-w-0 flex-1 rounded-lg border px-3 text-xs font-black outline-none focus:border-emerald-500 ${darkMode ? 'border-white/12 bg-[#0b1d3b] text-white' : 'border-[#071a3d]/12 bg-white text-[#071a3d]'}`}
                      >
                        {editorTargetOptions.map((target) => (
                          <option key={target.id} value={target.id}>{labelFor(target, isFa)}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        title={isFa ? 'بازنشانی بخش انتخاب‌شده' : 'Reset selected part'}
                        aria-label={isFa ? 'بازنشانی بخش انتخاب‌شده' : 'Reset selected part'}
                        onClick={() => resetEditorTarget(selectedTarget.id)}
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border ${darkMode ? 'border-white/12 bg-white/[0.05] hover:bg-white/[0.09]' : 'border-[#071a3d]/12 bg-white hover:bg-[#f0f4f3]'}`}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={copySelectedTargetTransform}
                      disabled={copyStatus === 'copying'}
                      className={`mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-xs font-black transition-colors disabled:cursor-wait disabled:opacity-70 ${copyStatus === 'success' ? darkMode ? 'border-emerald-400/60 bg-emerald-400/12 text-emerald-200' : 'border-emerald-600 bg-emerald-50 text-emerald-800' : copyStatus === 'error' ? darkMode ? 'border-rose-400/60 bg-rose-400/12 text-rose-200' : 'border-rose-500 bg-rose-50 text-rose-700' : darkMode ? 'border-white/12 bg-white/[0.05] text-white/75 hover:bg-white/[0.09]' : 'border-[#071a3d]/12 bg-white text-[#071a3d]/72 hover:bg-[#f0f4f3]'}`}
                    >
                      {copyStatus === 'success' ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                      <span aria-live="polite">
                        {copyStatus === 'copying'
                          ? (isFa ? 'در حال کپی...' : 'Copying...')
                          : copyStatus === 'success'
                            ? (isFa ? 'کد مختصات کپی شد' : 'Transform code copied')
                            : copyStatus === 'error'
                              ? (isFa ? 'کپی ناموفق بود؛ دوباره بزنید' : 'Copy failed; try again')
                              : (isFa ? 'کپی کد مختصات این قطعه' : 'Copy this part transform code')}
                      </span>
                    </button>
                  </Section>

                  <Section title={isFa ? 'ابزار ترنسفورم' : 'Transform tool'} darkMode={darkMode}>
                    <div className={`grid grid-cols-3 overflow-hidden rounded-lg border ${darkMode ? 'border-white/12' : 'border-[#071a3d]/12'}`}>
                      {[
                        { id: 'translate', fa: 'جابه‌جایی', en: 'Move', icon: Move3d },
                        { id: 'rotate', fa: 'چرخش', en: 'Rotate', icon: Orbit },
                        { id: 'scale', fa: 'مقیاس', en: 'Scale', icon: Box },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const selected = transformMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setTransformMode(mode.id)}
                            className={`flex h-11 items-center justify-center gap-1.5 border-e text-[10px] font-black last:border-e-0 ${darkMode ? 'border-white/10' : 'border-[#071a3d]/10'} ${selected ? 'bg-emerald-600 text-white' : darkMode ? 'bg-white/[0.04] text-white/62 hover:bg-white/[0.08]' : 'bg-white text-[#071a3d]/62 hover:bg-[#f2f6f5]'}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {labelFor(mode, isFa)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
                      {['local', 'world'].map((space) => (
                        <button
                          key={space}
                          type="button"
                          aria-pressed={transformSpace === space}
                          onClick={() => setTransformSpace(space)}
                          className={`h-9 rounded-lg border text-[10px] font-black ${transformSpace === space ? darkMode ? 'border-emerald-400 bg-emerald-400/12 text-emerald-200' : 'border-emerald-600 bg-emerald-50 text-emerald-800' : darkMode ? 'border-white/10 bg-white/[0.04] text-white/55' : 'border-[#071a3d]/10 bg-white text-[#071a3d]/55'}`}
                        >
                          {space === 'local' ? (isFa ? 'محلی' : 'Local') : (isFa ? 'جهانی' : 'World')}
                        </button>
                      ))}
                      <button
                        type="button"
                        aria-pressed={snapEnabled}
                        title={isFa ? 'اسنپ شبکه‌ای' : 'Grid snap'}
                        aria-label={isFa ? 'اسنپ شبکه‌ای' : 'Grid snap'}
                        onClick={() => setSnapEnabled((value) => !value)}
                        className={`grid h-9 w-10 place-items-center rounded-lg border ${snapEnabled ? 'border-emerald-600 bg-emerald-600 text-white' : darkMode ? 'border-white/10 bg-white/[0.04] text-white/55' : 'border-[#071a3d]/10 bg-white text-[#071a3d]/55'}`}
                      >
                        <Gauge className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3">
                      <EditorAxisFields
                        mode={transformMode}
                        state={selectedTargetState}
                        onChange={(patch) => updateEditorTarget(selectedTarget.id, patch)}
                        darkMode={darkMode}
                        isFa={isFa}
                      />
                    </div>
                  </Section>

                  {selectedTarget.materialScope !== 'none' && (
                    <Section title={isFa ? 'متریال هدف' : 'Target material'} darkMode={darkMode}>
                      <EditorMaterialGrid
                        value={selectedTargetState.material}
                        onChange={(material) => updateEditorTarget(selectedTarget.id, { material })}
                        darkMode={darkMode}
                        isFa={isFa}
                      />
                    </Section>
                  )}

                  <button
                    type="button"
                    onClick={() => setDraft((current) => sanitizeAstronautConfig({
                      ...current,
                      editor: { targets: {}, poseTargets: {} },
                    }))}
                    className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-xs font-black ${darkMode ? 'border-white/12 bg-white/[0.04] text-white/62 hover:bg-white/[0.08]' : 'border-[#071a3d]/12 bg-white text-[#071a3d]/62 hover:bg-[#f2f6f5]'}`}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {isFa ? 'بازنشانی تمام ادیت‌ها' : 'Reset all edits'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <footer className={`flex shrink-0 items-center justify-between gap-2 border-t px-4 py-3 sm:px-5 ${darkMode ? 'border-white/10' : 'border-[#071a3d]/10'}`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title={isFa ? 'انتخاب تصادفی' : 'Randomize'}
              aria-label={isFa ? 'انتخاب تصادفی' : 'Randomize'}
              onClick={() => setDraft(randomAstronautConfig())}
              className={`grid h-10 w-10 place-items-center rounded-full transition-colors ${darkMode ? 'bg-white/8 hover:bg-white/14' : 'bg-[#071a3d]/6 hover:bg-[#071a3d]/10'}`}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              type="button"
              title={isFa ? 'بازنشانی' : 'Reset'}
              aria-label={isFa ? 'بازنشانی' : 'Reset'}
              onClick={() => setDraft({ ...DEFAULT_ASTRONAUT_CONFIG })}
              className={`grid h-10 w-10 place-items-center rounded-full transition-colors ${darkMode ? 'bg-white/8 hover:bg-white/14' : 'bg-[#071a3d]/6 hover:bg-[#071a3d]/10'}`}
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onSave(sanitizeAstronautConfig(draft))}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-xs font-black text-white transition-colors hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <Save className="h-4 w-4" />
            <span>{isFa ? 'ذخیره فضانورد' : 'Save astronaut'}</span>
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
