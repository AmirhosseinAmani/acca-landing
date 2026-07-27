import * as THREE from 'three';
import { BODY_MATERIAL_TARGET_IDS } from '../../lib/astronautConfig';

const BODY_MATERIAL_PART_INDEX_BY_TARGET = new Map(
  BODY_MATERIAL_TARGET_IDS.map((targetId, index) => [targetId, index + 1])
);

/* Exact body-mesh upper-sleeve faces selected in the in-browser triangle editor
 * against astronaut-source.glb. Keep this tied to the source geometry signature
 * so a future model revision cannot receive stale triangle bindings by accident. */
const SOURCE_ARM_TRIANGLE_BINDINGS = Object.freeze({
  positionCount: 3254,
  indexCount: 4812,
  left: Object.freeze([
    837, 838, 839, 840, 841, 845, 846, 847, 848, 849, 850,
    851, 852, 853, 854, 857, 858, 859, 860, 861, 862, 863, 864,
  ]),
  right: Object.freeze([
    356, 357, 358, 359, 362, 363, 364, 365, 366, 367, 368,
    369, 370, 371, 373, 376, 377, 378, 379, 380, 381, 382, 383,
  ]),
});

/* The proximal forearm shells selected on the source body mesh. These faces
 * were previously classified as upper-arm geometry from their component
 * centers, so an elbow bend left part of the sleeve behind. */
const SOURCE_FOREARM_TRIANGLE_BINDINGS = Object.freeze({
  left: Object.freeze([
    769, 770, 771, 772, 773, 774, 775,
    776, 777, 778, 779, 780, 781, 782,
  ]),
  right: Object.freeze([
    288, 289, 290, 291, 292, 293, 294,
    295, 296, 297, 298, 299, 300, 301,
  ]),
});

/* Built-in PLSS faces selected on the source body mesh. The geometric part
 * detector already finds the main shell, while these exact faces keep the
 * front and side panels tied to the backpack color mask as well. */
const SOURCE_PACK_TRIANGLE_BINDINGS = Object.freeze([
  962, 963, 970, 971, 976, 977, 978, 979, 980,
  981, 984, 985, 1004, 1005, 1006, 1007, 1008, 1009,
]);

const SOURCE_TORSO_TRIANGLE_BINDINGS = Object.freeze([30, 31]);

/* Exact source-mesh faces identified by the user as suit fabric. Some of these
 * share UV colors with hardware, so geometry is the only reliable recolor mask. */
const SOURCE_SUIT_COLOR_TRIANGLE_BINDINGS = Object.freeze([
  4, 5, 6, 7, 10, 11, 14, 15, 30, 31,
  32, 33, 34, 35, 40, 42, 43, 44, 45, 118,
  119, 194, 195, 196, 203, 204, 205, 206, 207, 294,
  295, 297, 370, 371, 378, 379, 380, 381, 382, 383,
  390, 391, 392, 393, 485, 486, 488, 491, 492, 495,
  496, 511, 512, 513, 514, 515, 516, 521, 523, 524,
  525, 526, 597, 598, 675, 676, 677, 687, 688, 774,
  775, 776, 777, 778, 851, 852, 861, 863, 864, 871,
  872, 873, 874, 875, 876,
]);

function segmentMetrics(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const lengthSquared = Math.max(dx * dx + dy * dy + dz * dz, 0.000001);
  const projection = (
    (point.x - start.x) * dx
    + (point.y - start.y) * dy
    + (point.z - start.z) * dz
  ) / lengthSquared;
  const amount = THREE.MathUtils.clamp(projection, 0, 1);
  const closestX = start.x + dx * amount;
  const closestY = start.y + dy * amount;
  const closestZ = start.z + dz * amount;
  const distanceX = point.x - closestX;
  const distanceY = point.y - closestY;
  const distanceZ = point.z - closestZ;

  return {
    amount,
    distanceSquared: distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ,
  };
}

function smoothWeight(minimum, maximum, value) {
  return THREE.MathUtils.smoothstep(value, minimum, maximum);
}

const EMBEDDED_MODEL_PART_DEFINITIONS = Object.freeze([
  { id: 'body.helmet.shell', label: 'base helmet shell' },
  { id: 'body.pack.shell', label: 'built-in backpack shell' },
  { id: 'body.hose.right.upper', label: 'right upper hose' },
  { id: 'body.hose.right.lower', label: 'right lower hose' },
  { id: 'body.hose.left.upper', label: 'left upper hose' },
  { id: 'body.hose.left.lower', label: 'left lower hose' },
  { id: 'body.connector.right.upper', label: 'right upper chest connector' },
  { id: 'body.connector.right.lower', label: 'right lower chest connector' },
  { id: 'body.connector.left.upper', label: 'left upper chest connector' },
  { id: 'body.connector.left.lower', label: 'left lower chest connector' },
  { id: 'body.chest.panel', label: 'built-in chest panel' },
]);

function collectGeometryComponents(geometry, weldCoincidentVertices = false) {
  const positions = geometry.getAttribute('position');
  const index = geometry.getIndex();
  const parent = new Int32Array(positions.count);
  for (let vertex = 0; vertex < parent.length; vertex += 1) parent[vertex] = vertex;

  const find = (inputVertex) => {
    let vertex = inputVertex;
    let root = vertex;
    while (parent[root] !== root) root = parent[root];
    while (parent[vertex] !== vertex) {
      const next = parent[vertex];
      parent[vertex] = root;
      vertex = next;
    }
    return root;
  };
  const union = (first, second) => {
    const rootFirst = find(first);
    const rootSecond = find(second);
    if (rootFirst !== rootSecond) parent[rootSecond] = rootFirst;
  };

  if (index) {
    const triangleCount = Math.floor(index.count / 3);
    for (let triangle = 0; triangle < triangleCount; triangle += 1) {
      const first = index.getX(triangle * 3);
      union(first, index.getX(triangle * 3 + 1));
      union(first, index.getX(triangle * 3 + 2));
    }
  }

  if (weldCoincidentVertices) {
    const coincidentVertex = new Map();
    const precision = 100000;
    for (let vertex = 0; vertex < positions.count; vertex += 1) {
      const key = `${Math.round(positions.getX(vertex) * precision)}:${Math.round(positions.getY(vertex) * precision)}:${Math.round(positions.getZ(vertex) * precision)}`;
      const first = coincidentVertex.get(key);
      if (first === undefined) coincidentVertex.set(key, vertex);
      else union(first, vertex);
    }
  }

  const verticesByRoot = new Map();
  for (let vertex = 0; vertex < positions.count; vertex += 1) {
    const root = find(vertex);
    if (!verticesByRoot.has(root)) verticesByRoot.set(root, []);
    verticesByRoot.get(root).push(vertex);
  }

  const point = new THREE.Vector3();
  return [...verticesByRoot.values()].map((vertices) => {
    const bounds = new THREE.Box3();
    vertices.forEach((vertex) => {
      point.fromBufferAttribute(positions, vertex);
      bounds.expandByPoint(point);
    });
    return {
      vertices,
      bounds,
      center: bounds.getCenter(new THREE.Vector3()),
      size: bounds.getSize(new THREE.Vector3()),
      vertexCount: vertices.length,
    };
  });
}

function detectEmbeddedModelParts(geometry, bounds) {
  const positions = geometry.getAttribute('position');
  const components = collectGeometryComponents(geometry, true)
    .sort((first, second) => second.vertexCount - first.vertexCount);
  const targetIdByVertex = new Array(positions.count).fill(null);
  if (components.length < 2) return { parts: [], targetIdByVertex };

  const midpoint = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const candidates = components.slice(1);
  const assignments = new Map();
  const claimed = new Set();
  const remaining = () => candidates.filter((component) => !claimed.has(component));
  const assign = (id, component) => {
    if (!component) return;
    assignments.set(id, component);
    claimed.add(component);
  };
  const highest = (items) => [...items].sort((first, second) => second.center.y - first.center.y)[0];
  const rearmost = (items) => [...items].sort((first, second) => first.center.z - second.center.z)[0];

  assign('body.helmet.shell', highest(remaining()));
  assign(
    'body.pack.shell',
    rearmost(remaining().filter((component) => Math.abs(component.center.x - midpoint.x) < size.x * 0.16))
  );

  const centeredFrontParts = remaining().filter(
    (component) => Math.abs(component.center.x - midpoint.x) < size.x * 0.045
  );
  assign(
    'body.chest.panel',
    [...centeredFrontParts].sort((first, second) => second.center.z - first.center.z)[0]
  );

  const assignSideLevels = (kind, componentsToAssign) => {
    ['left', 'right'].forEach((side) => {
      const onSide = componentsToAssign
        .filter((component) => (
          side === 'left'
            ? component.center.x < midpoint.x
            : component.center.x >= midpoint.x
        ))
        .sort((first, second) => second.center.y - first.center.y);
      assign(`body.${kind}.${side}.upper`, onSide[0]);
      assign(`body.${kind}.${side}.lower`, onSide[1]);
    });
  };

  assignSideLevels(
    'hose',
    remaining().filter((component) => (
      component.vertexCount >= 100
      && Math.abs(component.center.x - midpoint.x) > size.x * 0.035
    ))
  );
  assignSideLevels(
    'connector',
    remaining().filter((component) => (
      component.vertexCount >= 30
      && Math.abs(component.center.x - midpoint.x) > size.x * 0.035
    ))
  );

  const parts = EMBEDDED_MODEL_PART_DEFINITIONS.flatMap((definition) => {
    const component = assignments.get(definition.id);
    if (!component) return [];
    component.vertices.forEach((vertex) => {
      targetIdByVertex[vertex] = definition.id;
    });
    return [{ ...definition, ...component }];
  });

  if (import.meta.env && import.meta.env.DEV && parts.length !== EMBEDDED_MODEL_PART_DEFINITIONS.length) {
    const detected = new Set(parts.map((part) => part.id));
    const missing = EMBEDDED_MODEL_PART_DEFINITIONS
      .filter((definition) => !detected.has(definition.id))
      .map((definition) => definition.id);
    console.warn(`[astronaut] embedded model-part detection missed: ${missing.join(', ')}`);
  }

  return { parts, targetIdByVertex };
}

function createBones(points, embeddedParts = []) {
  const rootBone = new THREE.Bone();
  rootBone.name = 'astronaut root';

  const controls = {};
  const editorControls = {};
  const embeddedBones = {};
  const createJoint = (parent, position, side, part) => {
    const editorOffset = new THREE.Group();
    const targetId = `rig.${side}.${part}`;
    editorOffset.name = `${side} ${part} editor offset`;
    editorOffset.position.copy(position);
    editorOffset.userData.web_id = targetId;
    editorOffset.userData.editorTargetId = targetId;
    parent.add(editorOffset);

    const bone = new THREE.Bone();
    bone.name = `${side} ${part}`;
    editorOffset.add(bone);
    editorControls[`${side}${part[0].toUpperCase()}${part.slice(1)}`] = editorOffset;
    controls[`${side}${part[0].toUpperCase()}${part.slice(1)}`] = bone;
    return bone;
  };

  ['left', 'right'].forEach((side) => {
    const shoulder = createJoint(rootBone, points[side].shoulder, side, 'shoulder');
    const elbow = createJoint(
      shoulder,
      points[side].elbow.clone().sub(points[side].shoulder),
      side,
      'elbow'
    );
    createJoint(
      elbow,
      points[side].hand.clone().sub(points[side].elbow),
      side,
      'hand'
    );

    const hip = createJoint(rootBone, points[side].hip, side, 'hip');
    createJoint(
      hip,
      points[side].knee.clone().sub(points[side].hip),
      side,
      'knee'
    );
  });

  embeddedParts.forEach((part) => {
    const editorOffset = new THREE.Group();
    editorOffset.name = `${part.label} editor offset`;
    editorOffset.position.copy(part.center);
    editorOffset.userData.web_id = part.id;
    editorOffset.userData.editorTargetId = part.id;
    rootBone.add(editorOffset);

    const bone = new THREE.Bone();
    bone.name = part.label;
    editorOffset.add(bone);
    embeddedBones[part.id] = bone;
    editorControls[part.id] = editorOffset;
  });

  return { rootBone, controls, editorControls, embeddedBones };
}

function isProtectedTorsoComponent(sample, componentBounds, bounds, size, midpoint) {
  if (!componentBounds) return false;
  const side = sample.x < midpoint.x ? 'left' : 'right';
  const innerX = side === 'left' ? componentBounds.max.x : componentBounds.min.x;
  const normalizedY = (sample.y - bounds.min.y) / size.y;
  const normalizedX = Math.abs(sample.x - midpoint.x) / size.x;
  const innerOutwardness = Math.abs(innerX - midpoint.x);

  /* The low-poly suit uses independent flat-shaded panels. These central
     underarm/flank panels sit close enough to the shoulder segment that a
     nearest-segment test can mistake them for sleeve geometry. Keeping this
     protected band on the torso prevents the side of the suit opening when
     an arm is raised or folded. */
  return (
    normalizedY > 0.5
    && normalizedY < 0.79
    && normalizedX < 0.235
    && innerOutwardness < size.x * 0.185
    && sample.z > bounds.min.z + size.z * 0.27
  );
}

function createSkinAttributes(geometry, bounds, points, boneIndices, embeddedParts) {
  const positions = geometry.getAttribute('position');
  const index = geometry.getIndex();
  const size = bounds.getSize(new THREE.Vector3());
  const midpoint = bounds.getCenter(new THREE.Vector3());
  const skinIndices = new Uint16Array(positions.count * 4);
  const skinWeights = new Float32Array(positions.count * 4);
  const materialTargetIdByVertex = embeddedParts?.targetIdByVertex
    ? [...embeddedParts.targetIdByVertex]
    : new Array(positions.count).fill(null);
  const point = new THREE.Vector3();

  const setWeights = (vertex, firstBone, firstWeight, secondBone = 0, secondWeight = 0) => {
    const offset = vertex * 4;
    skinIndices[offset] = firstBone;
    skinIndices[offset + 1] = secondBone;
    skinWeights[offset] = firstWeight;
    skinWeights[offset + 1] = secondWeight;
  };

  const classifyPart = (sample, componentBounds = null) => {
    const side = sample.x < midpoint.x ? 'left' : 'right';
    const limb = points[side];
    const bones = boneIndices[side];
    const absX = Math.abs(sample.x - midpoint.x);
    const innerX = componentBounds
      ? side === 'left' ? componentBounds.max.x : componentBounds.min.x
      : sample.x;
    const innerOutwardness = Math.abs(innerX - midpoint.x);
    const componentSize = componentBounds?.getSize(new THREE.Vector3()) || null;
    const normalizedY = (sample.y - bounds.min.y) / size.y;
    const normalizedZ = (sample.z - bounds.min.z) / size.z;
    const normalizedX = absX / size.x;
    const isProtectedTorso = isProtectedTorsoComponent(
      sample,
      componentBounds,
      bounds,
      size,
      midpoint
    );
    const isTorsoHose = Boolean(
      componentSize
      && normalizedY > 0.51
      && normalizedY < 0.58
      && normalizedX > 0.19
      && normalizedX < 0.3
      && normalizedZ < 0.54
      && componentSize.x < size.x * 0.08
      && componentSize.y < size.y * 0.05
    );
    const isInnerSleeveShell = Boolean(
      componentSize
      && normalizedY > 0.59
      && normalizedY < 0.82
      && normalizedX > 0.2
      && innerOutwardness > size.x * 0.185
      && normalizedZ > 0.27
      && (
        componentSize.x > size.x * 0.05
        || componentSize.y > size.y * 0.05
      )
    );
    const candidates = [];

    // The umbilical is torso hardware even where it passes through the arm envelope.
    if (isTorsoHose || isProtectedTorso) return null;

    if (
      sample.y > bounds.min.y + size.y * 0.34
      && sample.y < bounds.min.y + size.y * 0.59
      && absX > size.x * 0.34
      && innerOutwardness > size.x * 0.31
      && sample.z > bounds.min.z + size.z * 0.27
    ) {
      const metrics = segmentMetrics(sample, limb.elbow, limb.hand);
      candidates.push({
        part: 'hand',
        score: metrics.distanceSquared / ((size.x * 0.18) ** 2),
      });
    }

    if (
      (
        sample.y > bounds.min.y + size.y * 0.49
        && sample.y < bounds.min.y + size.y * 0.82
        && absX > size.x * 0.205
        && innerOutwardness > size.x * 0.185
        && sample.z > bounds.min.z + size.z * 0.27
      )
      || isInnerSleeveShell
    ) {
      const metrics = segmentMetrics(sample, limb.shoulder, limb.elbow);
      candidates.push({
        part: 'upperArm',
        score: metrics.distanceSquared / ((size.x * 0.165) ** 2),
        rigid: isInnerSleeveShell,
      });
    }

    if (
      sample.y > bounds.min.y + size.y * 0.34
      && sample.y < bounds.min.y + size.y * 0.63
      && absX > size.x * 0.245
      && innerOutwardness > size.x * 0.215
      && sample.z > bounds.min.z + size.z * 0.27
    ) {
      const metrics = segmentMetrics(sample, limb.elbow, limb.hand);
      candidates.push({
        part: 'forearm',
        score: metrics.distanceSquared / ((size.x * 0.165) ** 2),
      });
    }

    if (
      sample.y > bounds.min.y + size.y * 0.15
      && sample.y < bounds.min.y + size.y * 0.46
      && sample.z > bounds.min.z + size.z * 0.25
    ) {
      /* top capped BELOW the hip pivot: waist/flank panels stay on the root,
         otherwise a bent hip tears the flank open */
      const metrics = segmentMetrics(sample, limb.hip, limb.knee);
      candidates.push({
        part: 'thigh',
        score: metrics.distanceSquared / ((size.x * 0.17) ** 2),
      });
    }

    if (
      sample.y < bounds.min.y + size.y * 0.34
      && sample.z > bounds.min.z + size.z * 0.24
    ) {
      const metrics = segmentMetrics(sample, limb.knee, limb.ankle);
      candidates.push({
        part: 'lowerLeg',
        score: metrics.distanceSquared / ((size.x * 0.195) ** 2),
      });
    }

    const nearest = candidates.sort((first, second) => first.score - second.score)[0];
    if (nearest && nearest.score <= 1) return { ...nearest, side, limb, bones };

    /* Fallback: pieces that fail every gate (glove cuffs, sleeve trims …)
       previously stayed bound to the static root and visibly SEPARATED from
       the moving limb. Snap them to the nearest limb segment instead — but
       ONLY when they are clearly limb geometry. Torso-hugging parts (the
       waist hoses, flank panels, the PLSS) must stay on the static root, or
       they tear away with the leg when the hip bends. */
    if (sample.z > bounds.min.z + size.z * 0.3) {
      const segments = [];
      if (absX > size.x * 0.3) {
        /* clearly lateral -> arm chain (glove cuffs, wrist trims) */
        segments.push(
          { part: 'upperArm', start: limb.shoulder, end: limb.elbow },
          { part: 'forearm', start: limb.elbow, end: limb.hand },
          { part: 'hand', start: limb.hand, end: limb.hand },
        );
      }
      if (sample.y < bounds.min.y + size.y * 0.4) {
        /* clearly below the hip joint -> leg chain (boot trims, ankle rings) */
        segments.push(
          { part: 'thigh', start: limb.hip, end: limb.knee },
          { part: 'lowerLeg', start: limb.knee, end: limb.ankle },
        );
      }
      let best = null;
      segments.forEach((segment) => {
        const metrics = segmentMetrics(sample, segment.start, segment.end);
        if (!best || metrics.distanceSquared < best.distanceSquared) {
          best = { part: segment.part, distanceSquared: metrics.distanceSquared };
        }
      });
      const reach = size.x * 0.17;
      if (best && best.distanceSquared <= reach * reach) {
        return { part: best.part, score: best.distanceSquared / (reach * reach), side, limb, bones };
      }
    }
    return null;
  };

  const applyPartWeights = (vertex, part) => {
    point.fromBufferAttribute(positions, vertex);
    if (!part) {
      setWeights(vertex, 0, 1);
      return;
    }

    if (part.part === 'hand') {
      materialTargetIdByVertex[vertex] = `rig.${part.side}.hand`;
    } else if (part.part === 'forearm') {
      materialTargetIdByVertex[vertex] = `rig.${part.side}.elbow`;
    } else if (part.part === 'upperArm') {
      materialTargetIdByVertex[vertex] = `rig.${part.side}.shoulder`;
    }

    /* Keep a controlled overlap at every joint. The anchored edge follows the
       parent bone while the outer edge follows the moving limb, so the suit
       stretches through a bend instead of opening a visible seam. */
    if (part.part === 'hand') {
      /* Blend ACROSS the wrist: the forearm is 100% elbow and the glove was
         100% hand, so the abrupt switch tore the wrist open when the elbow
         bent. Wrist-side glove verts now share the elbow bone; only the
         fingers ride the hand bone fully. */
      const amount = segmentMetrics(point, part.limb.elbow, part.limb.hand).amount;
      const handWeight = smoothWeight(0.52, 0.94, amount);
      setWeights(vertex, part.bones.elbow, 1 - handWeight, part.bones.hand, handWeight);
    } else if (part.part === 'upperArm') {
      const amount = segmentMetrics(point, part.limb.shoulder, part.limb.elbow).amount;
      const shoulderWeight = smoothWeight(0, part.rigid ? 0.36 : 0.3, amount);
      setWeights(vertex, 0, 1 - shoulderWeight, part.bones.shoulder, shoulderWeight);
    } else if (part.part === 'forearm') {
      const amount = segmentMetrics(point, part.limb.elbow, part.limb.hand).amount;
      const elbowWeight = smoothWeight(0.02, 0.34, amount);
      setWeights(vertex, part.bones.shoulder, 1 - elbowWeight, part.bones.elbow, elbowWeight);
    } else if (part.part === 'thigh') {
      const amount = segmentMetrics(point, part.limb.hip, part.limb.knee).amount;
      const hipWeight = smoothWeight(0.02, 0.12, amount);
      setWeights(vertex, 0, 1 - hipWeight, part.bones.hip, hipWeight);
    } else {
      const amount = segmentMetrics(point, part.limb.knee, part.limb.ankle).amount;
      const kneeWeight = smoothWeight(0.03, 0.18, amount);
      setWeights(vertex, part.bones.hip, 1 - kneeWeight, part.bones.knee, kneeWeight);
    }
  };

  for (let vertex = 0; vertex < positions.count; vertex += 1) setWeights(vertex, 0, 1);

  if (index) {
    collectGeometryComponents(geometry).forEach((component) => {
      const embeddedTargetId = embeddedParts?.targetIdByVertex?.[component.vertices[0]];
      const embeddedBone = boneIndices.embedded?.[embeddedTargetId];
      if (embeddedTargetId && embeddedBone !== undefined) {
        component.vertices.forEach((vertex) => setWeights(vertex, embeddedBone, 1));
        return;
      }
      const part = classifyPart(component.center, component.bounds);
      component.vertices.forEach((vertex) => applyPartWeights(vertex, part));
    });
  } else {
    for (let vertex = 0; vertex < positions.count; vertex += 1) {
      const embeddedTargetId = embeddedParts?.targetIdByVertex?.[vertex];
      const embeddedBone = boneIndices.embedded?.[embeddedTargetId];
      if (embeddedTargetId && embeddedBone !== undefined) {
        setWeights(vertex, embeddedBone, 1);
        continue;
      }
      point.fromBufferAttribute(positions, vertex);
      applyPartWeights(vertex, classifyPart(point));
    }
  }

  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  return materialTargetIdByVertex;
}

function createAnchor(parent, name, position, rotation = null) {
  const anchor = new THREE.Group();
  anchor.name = name;
  anchor.position.copy(position);
  if (rotation) anchor.rotation.copy(rotation);
  parent.add(anchor);
  return anchor;
}

/* When the loaded GLB already carries a real armature (the Blender-rigged
 * production model), adopt its BAKED skin weights instead of the heuristic
 * guess. The web keeps its own clean 11-bone skeleton + pose code; we only
 * remap each baked influence's bone by NAME onto the matching web bone
 * (torso/spine/head bones collapse to the static root). Baked weights are
 * heat-blurred across joints, so bends no longer tear. Returns false when the
 * mesh is not a rigged source, so the caller falls back to the heuristic. */
function transferBakedWeights(geometry, sourceMesh, boneIndices) {
  const skinIndex = geometry.getAttribute('skinIndex');
  const skinWeight = geometry.getAttribute('skinWeight');
  const bones = sourceMesh.skeleton ? sourceMesh.skeleton.bones : [];
  if (!skinIndex || !skinWeight || bones.length === 0) return false;

  const webIndexByBoneName = {
    'left shoulder': boneIndices.left.shoulder,
    'left elbow': boneIndices.left.elbow,
    'left hand': boneIndices.left.hand,
    'left hip': boneIndices.left.hip,
    'left knee': boneIndices.left.knee,
    'right shoulder': boneIndices.right.shoulder,
    'right elbow': boneIndices.right.elbow,
    'right hand': boneIndices.right.hand,
    'right hip': boneIndices.right.hip,
    'right knee': boneIndices.right.knee,
  };
  const webBoneFor = (sourceBoneIndex) => {
    const bone = bones[sourceBoneIndex];
    if (!bone) return 0;
    const web = webIndexByBoneName[String(bone.name).toLowerCase()];
    return web === undefined ? 0 : web; // torso/spine/chest/head -> static root
  };

  const count = skinIndex.count;
  const outIndex = new Uint16Array(count * 4);
  const outWeight = new Float32Array(count * 4);
  for (let vertex = 0; vertex < count; vertex += 1) {
    const merged = new Map();
    for (let influence = 0; influence < 4; influence += 1) {
      const weight = skinWeight.getComponent(vertex, influence);
      if (weight <= 0) continue;
      const web = webBoneFor(skinIndex.getComponent(vertex, influence));
      merged.set(web, (merged.get(web) || 0) + weight);
    }
    const top = [...merged.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const total = top.reduce((sum, entry) => sum + entry[1], 0);
    if (total <= 0) {
      outIndex[vertex * 4] = 0;
      outWeight[vertex * 4] = 1;
      continue;
    }
    for (let slot = 0; slot < top.length; slot += 1) {
      outIndex[vertex * 4 + slot] = top[slot][0];
      outWeight[vertex * 4 + slot] = top[slot][1] / total;
    }
  }

  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(outIndex, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(outWeight, 4));
  if (import.meta.env && import.meta.env.DEV) {
    console.info(`[astronaut] adopted Blender-baked skin weights for ${count} vertices`);
  }
  return true;
}

function inferMaterialTargetsFromSkinWeights(geometry, embeddedParts, boneIndices) {
  const skinIndex = geometry.getAttribute('skinIndex');
  const skinWeight = geometry.getAttribute('skinWeight');
  const targetIdByVertex = embeddedParts?.targetIdByVertex
    ? [...embeddedParts.targetIdByVertex]
    : new Array(skinIndex?.count || 0).fill(null);
  if (!skinIndex || !skinWeight) return targetIdByVertex;

  const targetByBone = new Map([
    [boneIndices.left.shoulder, 'rig.left.shoulder'],
    [boneIndices.left.elbow, 'rig.left.elbow'],
    [boneIndices.left.hand, 'rig.left.hand'],
    [boneIndices.right.shoulder, 'rig.right.shoulder'],
    [boneIndices.right.elbow, 'rig.right.elbow'],
    [boneIndices.right.hand, 'rig.right.hand'],
  ]);
  Object.entries(boneIndices.embedded || {}).forEach(([targetId, boneIndex]) => {
    targetByBone.set(boneIndex, targetId);
  });

  for (let vertex = 0; vertex < skinIndex.count; vertex += 1) {
    if (targetIdByVertex[vertex]) continue;
    let strongestBone = 0;
    let strongestWeight = -1;
    for (let influence = 0; influence < 4; influence += 1) {
      const weight = skinWeight.getComponent(vertex, influence);
      if (weight > strongestWeight) {
        strongestWeight = weight;
        strongestBone = skinIndex.getComponent(vertex, influence);
      }
    }
    targetIdByVertex[vertex] = targetByBone.get(strongestBone) || null;
  }
  return targetIdByVertex;
}

function applyBodyMaterialPartAttribute(geometry, targetIdByVertex) {
  const positions = geometry.getAttribute('position');
  const partIndices = new Float32Array(positions.count);
  for (let vertex = 0; vertex < positions.count; vertex += 1) {
    partIndices[vertex] = BODY_MATERIAL_PART_INDEX_BY_TARGET.get(targetIdByVertex?.[vertex]) || 0;
  }
  geometry.setAttribute(
    'astronautEditorPartId',
    new THREE.Float32BufferAttribute(partIndices, 1)
  );
}

function applyStructuralWeightOverrides(geometry, bounds, embeddedParts, boneIndices) {
  const skinIndex = geometry.getAttribute('skinIndex');
  const skinWeight = geometry.getAttribute('skinWeight');
  if (!skinIndex || !skinWeight) return;

  const size = bounds.getSize(new THREE.Vector3());
  const midpoint = bounds.getCenter(new THREE.Vector3());
  const setRigidWeight = (vertex, bone) => {
    const offset = vertex * 4;
    for (let influence = 0; influence < 4; influence += 1) {
      skinIndex.array[offset + influence] = influence === 0 ? bone : 0;
      skinWeight.array[offset + influence] = influence === 0 ? 1 : 0;
    }
  };

  collectGeometryComponents(geometry).forEach((component) => {
    const embeddedTargetId = embeddedParts?.targetIdByVertex?.[component.vertices[0]];
    const embeddedBone = boneIndices.embedded?.[embeddedTargetId];
    if (embeddedTargetId && embeddedBone !== undefined) {
      component.vertices.forEach((vertex) => setRigidWeight(vertex, embeddedBone));
      return;
    }
    if (isProtectedTorsoComponent(component.center, component.bounds, bounds, size, midpoint)) {
      component.vertices.forEach((vertex) => setRigidWeight(vertex, 0));
    }
  });
  skinIndex.needsUpdate = true;
  skinWeight.needsUpdate = true;
}

function applySelectedTriangleBindings(geometry, points, boneIndices, materialTargetIdByVertex) {
  const positions = geometry.getAttribute('position');
  const index = geometry.getIndex();
  const skinIndex = geometry.getAttribute('skinIndex');
  const skinWeight = geometry.getAttribute('skinWeight');
  const suitColorMask = new Float32Array(positions?.count || 0);
  geometry.setAttribute(
    'astronautSuitColorMask',
    new THREE.Float32BufferAttribute(suitColorMask, 1)
  );
  const signatureMatches = Boolean(
    positions
    && index
    && positions.count === SOURCE_ARM_TRIANGLE_BINDINGS.positionCount
    && index.count === SOURCE_ARM_TRIANGLE_BINDINGS.indexCount
  );
  if (!signatureMatches || !skinIndex || !skinWeight) return;

  const boundVertices = {
    torso: new Set(),
    pack: new Set(),
    suitColor: new Set(),
    upperArm: { left: new Set(), right: new Set() },
    forearm: { left: new Set(), right: new Set() },
  };
  const point = new THREE.Vector3();
  const coordinatePrecision = 100000;
  const coordinateKey = (vertex) => (
    `${Math.round(positions.getX(vertex) * coordinatePrecision)}:`
    + `${Math.round(positions.getY(vertex) * coordinatePrecision)}:`
    + `${Math.round(positions.getZ(vertex) * coordinatePrecision)}`
  );
  const coincidentVerticesByKey = new Map();
  for (let vertex = 0; vertex < positions.count; vertex += 1) {
    const key = coordinateKey(vertex);
    if (!coincidentVerticesByKey.has(key)) coincidentVerticesByKey.set(key, []);
    coincidentVerticesByKey.get(key).push(vertex);
  }
  const setRigidWeight = (vertex, bone) => {
    const offset = vertex * 4;
    for (let influence = 0; influence < 4; influence += 1) {
      skinIndex.array[offset + influence] = influence === 0 ? bone : 0;
      skinWeight.array[offset + influence] = influence === 0 ? 1 : 0;
    }
  };
  const setBlendWeight = (vertex, parentBone, childBone, childWeight) => {
    const offset = vertex * 4;
    const weight = THREE.MathUtils.clamp(childWeight, 0, 1);
    skinIndex.array[offset] = parentBone;
    skinIndex.array[offset + 1] = childBone;
    skinIndex.array[offset + 2] = 0;
    skinIndex.array[offset + 3] = 0;
    skinWeight.array[offset] = 1 - weight;
    skinWeight.array[offset + 1] = weight;
    skinWeight.array[offset + 2] = 0;
    skinWeight.array[offset + 3] = 0;
  };
  const collectTriangleCoordinateKeys = (triangles) => {
    const keys = new Set();
    triangles.forEach((triangle) => {
      const triangleOffset = triangle * 3;
      for (let corner = 0; corner < 3; corner += 1) {
        const vertex = index.getX(triangleOffset + corner);
        keys.add(coordinateKey(vertex));
      }
    });
    return keys;
  };
  const selectedCoordinateKeys = {
    upperArm: {
      left: collectTriangleCoordinateKeys(SOURCE_ARM_TRIANGLE_BINDINGS.left),
      right: collectTriangleCoordinateKeys(SOURCE_ARM_TRIANGLE_BINDINGS.right),
    },
    forearm: {
      left: collectTriangleCoordinateKeys(SOURCE_FOREARM_TRIANGLE_BINDINGS.left),
      right: collectTriangleCoordinateKeys(SOURCE_FOREARM_TRIANGLE_BINDINGS.right),
    },
    pack: collectTriangleCoordinateKeys(SOURCE_PACK_TRIANGLE_BINDINGS),
    suitColor: collectTriangleCoordinateKeys(SOURCE_SUIT_COLOR_TRIANGLE_BINDINGS),
  };

  selectedCoordinateKeys.suitColor.forEach((key) => {
    (coincidentVerticesByKey.get(key) || []).forEach((vertex) => {
      suitColorMask[vertex] = 1;
      boundVertices.suitColor.add(vertex);
    });
  });
  const applyArmWeight = (vertex, side, part) => {
    point.fromBufferAttribute(positions, vertex);
    if (part === 'shoulder') {
      const progress = segmentMetrics(
        point,
        points[side].shoulder,
        points[side].elbow
      ).amount;
      setBlendWeight(
        vertex,
        0,
        boneIndices[side].shoulder,
        smoothWeight(0, 0.36, progress)
      );
    } else if (part === 'elbow') {
      const progress = segmentMetrics(
        point,
        points[side].elbow,
        points[side].hand
      ).amount;
      setBlendWeight(
        vertex,
        boneIndices[side].shoulder,
        boneIndices[side].elbow,
        smoothWeight(0, 0.34, progress)
      );
    } else {
      const progress = segmentMetrics(
        point,
        points[side].elbow,
        points[side].hand
      ).amount;
      setBlendWeight(
        vertex,
        boneIndices[side].elbow,
        boneIndices[side].hand,
        smoothWeight(0.52, 0.94, progress)
      );
    }
    materialTargetIdByVertex[vertex] = `rig.${side}.${part}`;
  };

  SOURCE_TORSO_TRIANGLE_BINDINGS.forEach((triangle) => {
    const triangleOffset = triangle * 3;
    for (let corner = 0; corner < 3; corner += 1) {
      const vertex = index.getX(triangleOffset + corner);
      boundVertices.torso.add(vertex);
      setRigidWeight(vertex, 0);
      materialTargetIdByVertex[vertex] = null;
    }
  });

  selectedCoordinateKeys.pack.forEach((key) => {
    (coincidentVerticesByKey.get(key) || []).forEach((vertex) => {
      setRigidWeight(vertex, 0);
      materialTargetIdByVertex[vertex] = 'body.pack.shell';
      boundVertices.pack.add(vertex);
    });
  });

  const applySelectedRegion = (side, part, keys, destination) => {
    keys.forEach((key) => {
      (coincidentVerticesByKey.get(key) || []).forEach((vertex) => {
        if (boundVertices.torso.has(vertex)) return;
        applyArmWeight(vertex, side, part);
        destination.add(vertex);
      });
    });
  };

  ['left', 'right'].forEach((side) => {
    applySelectedRegion(
      side,
      'shoulder',
      selectedCoordinateKeys.upperArm[side],
      boundVertices.upperArm[side]
    );
    applySelectedRegion(
      side,
      'elbow',
      selectedCoordinateKeys.forearm[side],
      boundVertices.forearm[side]
    );
  });

  /* Flat-shaded faces duplicate their edge vertices. Stitch every coincident
     arm-edge copy to the same continuous bone chain; otherwise two visually
     joined faces can separate when the elbow or wrist rotates. */
  const armTargetPattern = /^rig\.(left|right)\.(shoulder|elbow|hand)$/;
  const partPriority = { shoulder: 1, elbow: 2, hand: 3 };
  let stitchedSeamGroups = 0;
  coincidentVerticesByKey.forEach((vertices, key) => {
    if (vertices.length < 2 || vertices.some((vertex) => boundVertices.torso.has(vertex))) return;

    let side = null;
    let part = null;
    if (selectedCoordinateKeys.forearm.left.has(key)) {
      side = 'left';
      part = 'elbow';
    } else if (selectedCoordinateKeys.forearm.right.has(key)) {
      side = 'right';
      part = 'elbow';
    } else if (selectedCoordinateKeys.upperArm.left.has(key)) {
      side = 'left';
      part = 'shoulder';
    } else if (selectedCoordinateKeys.upperArm.right.has(key)) {
      side = 'right';
      part = 'shoulder';
    } else {
      vertices.forEach((vertex) => {
        const match = armTargetPattern.exec(materialTargetIdByVertex[vertex] || '');
        if (!match || (side && side !== match[1])) return;
        side = match[1];
        if (!part || partPriority[match[2]] > partPriority[part]) part = match[2];
      });
    }
    if (!side || !part) return;

    let changed = false;
    vertices.forEach((vertex) => {
      const targetId = materialTargetIdByVertex[vertex];
      if (targetId?.startsWith('body.')) return;
      const match = armTargetPattern.exec(targetId || '');
      if (match && match[1] !== side) return;
      applyArmWeight(vertex, side, part);
      changed = true;
    });
    if (changed) stitchedSeamGroups += 1;
  });

  skinIndex.needsUpdate = true;
  skinWeight.needsUpdate = true;
  geometry.getAttribute('astronautSuitColorMask').needsUpdate = true;
  geometry.userData.exactTriangleBindings = {
    schema: 'acca.astronaut-triangle-bindings/v1',
    source: 'user-selected-triangles',
    torso: {
      triangleCount: SOURCE_TORSO_TRIANGLE_BINDINGS.length,
      vertexCount: boundVertices.torso.size,
    },
    pack: {
      triangleCount: SOURCE_PACK_TRIANGLE_BINDINGS.length,
      vertexCount: boundVertices.pack.size,
    },
    suitColor: {
      triangleCount: SOURCE_SUIT_COLOR_TRIANGLE_BINDINGS.length,
      vertexCount: boundVertices.suitColor.size,
    },
    upperArm: {
      left: {
        triangleCount: SOURCE_ARM_TRIANGLE_BINDINGS.left.length,
        vertexCount: boundVertices.upperArm.left.size,
      },
      right: {
        triangleCount: SOURCE_ARM_TRIANGLE_BINDINGS.right.length,
        vertexCount: boundVertices.upperArm.right.size,
      },
    },
    forearm: {
      left: {
        triangleCount: SOURCE_FOREARM_TRIANGLE_BINDINGS.left.length,
        vertexCount: boundVertices.forearm.left.size,
      },
      right: {
        triangleCount: SOURCE_FOREARM_TRIANGLE_BINDINGS.right.length,
        vertexCount: boundVertices.forearm.right.size,
      },
    },
    stitchedSeamGroups,
  };
}

export function createAstronautRig(sourceMesh, material, geometries) {
  sourceMesh.updateMatrixWorld(true);
  const geometry = sourceMesh.geometry.clone();
  geometry.applyMatrix4(sourceMesh.matrixWorld);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometries.add(geometry);

  const bounds = geometry.boundingBox.clone();
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const point = (x, y, z) => new THREE.Vector3(
    center.x + size.x * x,
    bounds.min.y + size.y * y,
    center.z + size.z * z
  );
  const points = {
    left: {
      shoulder: point(-0.193, 0.732, 0.22),
      elbow: point(-0.338, 0.522, 0.07),
      hand: point(-0.47, 0.43, 0.12),
      hip: point(-0.105, 0.43, 0.1),
      knee: point(-0.129, 0.224, 0.119),
      ankle: point(-0.135, 0.065, 0.12),
    },
    right: {
      shoulder: point(0.193, 0.732, 0.22),
      elbow: point(0.338, 0.522, 0.07),
      hand: point(0.47, 0.43, 0.12),
      hip: point(0.105, 0.43, 0.1),
      knee: point(0.129, 0.224, 0.119),
      ankle: point(0.135, 0.065, 0.12),
    },
  };
  const embeddedParts = detectEmbeddedModelParts(geometry, bounds);
  const {
    rootBone,
    controls,
    editorControls,
    embeddedBones,
  } = createBones(points, embeddedParts.parts);
  const bones = [
    rootBone,
    controls.leftShoulder,
    controls.leftElbow,
    controls.rightShoulder,
    controls.rightElbow,
    controls.leftHip,
    controls.leftKnee,
    controls.rightHip,
    controls.rightKnee,
    controls.leftHand,
    controls.rightHand,
  ];
  const embeddedBoneIndices = {};
  embeddedParts.parts.forEach((part) => {
    const bone = embeddedBones[part.id];
    if (!bone) return;
    embeddedBoneIndices[part.id] = bones.length;
    bones.push(bone);
  });
  const boneIndices = {
    left: { shoulder: 1, elbow: 2, hand: 9, hip: 5, knee: 6 },
    right: { shoulder: 3, elbow: 4, hand: 10, hip: 7, knee: 8 },
    embedded: embeddedBoneIndices,
  };

  const adoptedBakedWeights =
    sourceMesh.isSkinnedMesh && transferBakedWeights(geometry, sourceMesh, boneIndices);
  let materialTargetIdByVertex;
  if (adoptedBakedWeights) {
    applyStructuralWeightOverrides(geometry, bounds, embeddedParts, boneIndices);
    materialTargetIdByVertex = inferMaterialTargetsFromSkinWeights(
      geometry,
      embeddedParts,
      boneIndices
    );
  } else {
    materialTargetIdByVertex = createSkinAttributes(
      geometry,
      bounds,
      points,
      boneIndices,
      embeddedParts
    );
  }
  applySelectedTriangleBindings(geometry, points, boneIndices, materialTargetIdByVertex);
  applyBodyMaterialPartAttribute(geometry, materialTargetIdByVertex);

  const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
  skinnedMesh.name = 'ACCA skinned astronaut';
  skinnedMesh.frustumCulled = false;
  skinnedMesh.add(rootBone);

  const root = new THREE.Group();
  root.name = 'Astronaut skeletal rig';
  root.add(skinnedMesh);
  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  skinnedMesh.bind(skeleton);

  /* Anchors hug the sleeve so the patch grazes the fabric (slightly sunken
     reads as printed-on; standing proud reads as floating). */
  const leftSleeve = createAnchor(
    controls.leftShoulder,
    'left sleeve patch anchor',
    new THREE.Vector3(-size.x * 0.082, -size.y * 0.05, size.z * 0.052),
    new THREE.Euler(0, -0.78, 0)
  );
  const rightSleeve = createAnchor(
    controls.rightShoulder,
    'right sleeve patch anchor',
    new THREE.Vector3(size.x * 0.082, -size.y * 0.05, size.z * 0.052),
    new THREE.Euler(0, 0.78, 0)
  );
  return {
    root,
    controls,
    editorControls,
    anchors: { leftSleeve, rightSleeve },
    bounds,
    skeleton,
    motion: {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      bob: 0.02,
    },
  };
}

function resetControls(rig) {
  Object.values(rig.controls).forEach((control) => control.rotation.set(0, 0, 0));
  rig.motion.position.set(0, 0, 0);
  rig.motion.rotation.set(0, 0, 0);
  rig.motion.bob = 0.018;
}

export function updateAstronautRig(rig, pose, time) {
  resetControls(rig);
  const { controls, motion } = rig;

  if (pose === 'drift') {
    motion.rotation.set(0.06, 0.04, 0.11);
    motion.position.set(0.015, 0.025, 0);
    motion.bob = 0.028;
    controls.leftShoulder.rotation.x = -0.08;
    controls.rightShoulder.rotation.x = -0.13;
  } else if (pose === 'reference') {
    motion.rotation.set(-0.14, 0.045, -0.055);
    motion.position.set(0.01, 0.085, 0);
    controls.leftHip.rotation.x = -0.78;
    controls.rightHip.rotation.x = -0.86;
    controls.leftHip.rotation.z = -0.2;
    controls.rightHip.rotation.z = 0.2;
    controls.leftKnee.rotation.set(1.32, 0, 0.2);
    controls.rightKnee.rotation.set(1.4, 0, -0.2);
    controls.leftShoulder.rotation.set(-0.3, 0, -0.1);
    controls.rightShoulder.rotation.set(-0.34, 0, 0.2);
    controls.rightElbow.rotation.z = 0.45;
    motion.bob = 0.03;
  } else if (pose === 'sit') {
    motion.position.y = 0.07;
    motion.rotation.z = -0.025;
    controls.leftHip.rotation.x = -0.78;
    controls.rightHip.rotation.x = -0.78;
    controls.leftKnee.rotation.x = 0.96;
    controls.rightKnee.rotation.x = 0.96;
    controls.leftShoulder.rotation.x = -0.1;
    controls.rightShoulder.rotation.x = -0.12;
    motion.bob = 0.012;
  } else if (pose === 'walk') {
    const stride = Math.sin(time * 2.7);
    const liftLeft = Math.max(0, stride);
    const liftRight = Math.max(0, -stride);
    controls.leftHip.rotation.x = stride * 0.28;
    controls.rightHip.rotation.x = -stride * 0.28;
    controls.leftKnee.rotation.x = liftRight * 0.3;
    controls.rightKnee.rotation.x = liftLeft * 0.3;
    controls.leftShoulder.rotation.x = -stride * 0.16;
    controls.rightShoulder.rotation.x = stride * 0.16;
    motion.position.y = Math.abs(Math.cos(time * 2.7)) * 0.014;
    motion.bob = 0;
  } else if (pose === 'jet') {
    motion.rotation.set(-0.17, 0.04, 0.07);
    motion.position.set(0.02, 0.07, 0);
    controls.leftHip.rotation.x = -0.24;
    controls.rightHip.rotation.x = -0.3;
    controls.leftKnee.rotation.x = 0.48;
    controls.rightKnee.rotation.x = 0.4;
    controls.leftShoulder.rotation.set(-0.18, 0, -0.06);
    controls.rightShoulder.rotation.set(-0.18, 0, 0.06);
    motion.bob = 0.035;
  }

  return motion;
}
