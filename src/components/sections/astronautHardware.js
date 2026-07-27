import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ACCENT_FINISHES, SUIT_FINISHES } from '../../lib/astronautConfig';

const SUIT_FINISH_BY_ID = new Map(SUIT_FINISHES.map((finish) => [finish.id, finish]));
const ACCENT_FINISH_BY_ID = new Map(ACCENT_FINISHES.map((finish) => [finish.id, finish]));

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  if (typeof context.roundRect === 'function') context.roundRect(x, y, width, height, radius);
  else context.rect(x, y, width, height);
  context.fill();
}

function drawStar(context, cx, cy, outer, inner, points = 5) {
  context.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / points;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
}

function createPatchTexture(id, accentHex, bare = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  const isFlag = id === 'turkey' || id === 'iran' || id === 'azerbaijan';
  if (!bare || isFlag) {
    context.fillStyle = '#f4f2ea';
    roundedRect(context, 4, 4, 312, 172, 24);
  }

  if (id === 'turkey') {
    context.fillStyle = '#c92535';
    roundedRect(context, 12, 12, 296, 156, 18);
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(142, 90, 50, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#c92535';
    context.beginPath();
    context.arc(160, 90, 41, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    drawStar(context, 214, 90, 24, 10);
  } else if (id === 'iran') {
    context.save();
    context.beginPath();
    context.rect(12, 12, 296, 156);
    context.clip();
    context.fillStyle = '#239f40';
    context.fillRect(12, 12, 296, 52);
    context.fillStyle = '#ffffff';
    context.fillRect(12, 64, 296, 52);
    context.fillStyle = '#da2637';
    context.fillRect(12, 116, 296, 52);
    context.fillStyle = '#da2637';
    context.beginPath();
    context.arc(160, 90, 20, 0, Math.PI * 2);
    context.fill();
    context.restore();
  } else if (id === 'azerbaijan') {
    context.save();
    context.beginPath();
    context.rect(12, 12, 296, 156);
    context.clip();
    context.fillStyle = '#00b5e2';
    context.fillRect(12, 12, 296, 52);
    context.fillStyle = '#ef3340';
    context.fillRect(12, 64, 296, 52);
    context.fillStyle = '#509e2f';
    context.fillRect(12, 116, 296, 52);
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(151, 90, 29, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ef3340';
    context.beginPath();
    context.arc(161, 90, 24, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    drawStar(context, 204, 90, 15, 6, 8);
    context.restore();
  } else {
    const accent = `#${accentHex.toString(16).padStart(6, '0')}`;
    if (!bare) {
      context.fillStyle = '#071a3d';
      roundedRect(context, 12, 12, 296, 156, 18);
    }

    if (id === 'acca-mark') {
      context.fillStyle = bare ? 'rgba(244,242,234,0.92)' : '#f4f2ea';
      roundedRect(context, 104, 18, 112, 144, 20);
      context.strokeStyle = '#0b3158';
      context.lineWidth = 9;
      context.beginPath();
      context.moveTo(130, 56);
      context.lineTo(190, 90);
      context.lineTo(130, 124);
      context.stroke();
    } else if (id === 'university') {
      context.strokeStyle = accent;
      context.fillStyle = bare ? accent : '#f4f2ea';
      context.lineWidth = 8;
      context.beginPath();
      context.moveTo(160, 39);
      context.lineTo(225, 72);
      context.lineTo(95, 72);
      context.closePath();
      context.fill();
      context.stroke();
      [116, 145, 175, 204].forEach((x) => {
        context.beginPath();
        context.moveTo(x, 76);
        context.lineTo(x, 127);
        context.stroke();
      });
      context.beginPath();
      context.moveTo(86, 132);
      context.lineTo(234, 132);
      context.stroke();
      context.font = '900 22px Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('UNI', 160, 151);
    } else if (id === 'orbit') {
      context.strokeStyle = accent;
      context.lineWidth = 9;
      context.beginPath();
      context.ellipse(160, 90, 112, 54, -0.28, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = accent;
      context.beginPath();
      context.arc(160, 90, 38, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#071a3d';
      context.beginPath();
      context.arc(174, 80, 31, 0, Math.PI * 2);
      context.fill();
    } else if (id === 'lunar') {
      context.fillStyle = '#d7c27a';
      context.beginPath();
      context.arc(158, 88, 50, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = bare ? 'rgba(7,26,61,0.9)' : '#071a3d';
      context.beginPath();
      context.arc(179, 75, 43, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = accent;
      drawStar(context, 220, 58, 15, 6);
      context.strokeStyle = accent;
      context.lineWidth = 7;
      context.beginPath();
      context.ellipse(160, 92, 116, 56, -0.22, 0, Math.PI * 2);
      context.stroke();
    } else if (id === 'earth') {
      context.fillStyle = '#3f9ac5';
      context.beginPath();
      context.arc(160, 90, 52, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#44a77c';
      context.beginPath();
      context.ellipse(145, 76, 27, 13, -0.38, 0, Math.PI * 2);
      context.ellipse(177, 104, 22, 11, 0.42, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = accent;
      context.lineWidth = 8;
      context.beginPath();
      context.ellipse(160, 90, 118, 49, 0.24, 0, Math.PI * 2);
      context.stroke();
    } else if (id === 'science') {
      context.strokeStyle = accent;
      context.lineWidth = 8;
      [-0.6, 0, 0.6].forEach((rotation) => {
        context.beginPath();
        context.ellipse(160, 90, 92, 32, rotation, 0, Math.PI * 2);
        context.stroke();
      });
      context.fillStyle = '#f4f2ea';
      context.beginPath();
      context.arc(160, 90, 17, 0, Math.PI * 2);
      context.fill();
    } else if (id === 'mars') {
      context.fillStyle = '#b8553d';
      context.beginPath();
      context.arc(160, 90, 52, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#7c342d';
      [[139, 72, 9], [179, 102, 12], [152, 113, 6]].forEach(([x, y, radius]) => {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });
      context.strokeStyle = accent;
      context.lineWidth = 8;
      context.beginPath();
      context.ellipse(160, 90, 118, 46, -0.3, 0, Math.PI * 2);
      context.stroke();
    } else {
      context.strokeStyle = accent;
      context.lineWidth = 9;
      context.beginPath();
      context.ellipse(160, 90, 112, 54, -0.28, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = accent;
      context.font = '900 70px Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('ACCA', 160, 94);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (id === 'acca-mark') {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const size = bare ? 142 : 134;
      context.drawImage(image, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size);
      texture.needsUpdate = true;
    };
    image.src = '/favicon-512x512.png';
  }
  return texture;
}

function createCurvedSleevePatchGeometry(width, height) {
  const geometry = new THREE.PlaneGeometry(width, height, 8, 2);
  const positions = geometry.attributes.position;
  const halfWidth = width / 2;
  for (let index = 0; index < positions.count; index += 1) {
    const normalizedX = positions.getX(index) / halfWidth;
    positions.setZ(index, -0.018 * normalizedX * normalizedX);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export function createAstronautHardware({ envTexture, rig, geometries, materials, textures }) {
  const trackGeometry = (geometry) => {
    geometries.add(geometry);
    return geometry;
  };
  const trackMaterial = (material) => {
    materials.add(material);
    return material;
  };
  const mesh = (geometry, material) => new THREE.Mesh(trackGeometry(geometry), material);
  const roundedBox = (width, height, depth, radius, material) =>
    mesh(new RoundedBoxGeometry(width, height, depth, 3, radius), material);
  const cylinder = (radius, height, material, segments = 18) =>
    mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);

  const suitShell = trackMaterial(new THREE.MeshPhysicalMaterial({
    color: 0xebece7,
    roughness: 0.62,
    metalness: 0.015,
    clearcoat: 0.12,
    clearcoatRoughness: 0.5,
    envMap: envTexture,
    envMapIntensity: 0.9,
  }));
  const darkHardware = trackMaterial(new THREE.MeshStandardMaterial({
    color: 0x17202d,
    roughness: 0.32,
    metalness: 0.42,
    envMap: envTexture,
    envMapIntensity: 1.2,
  }));
  const chestPrimary = trackMaterial(new THREE.MeshPhysicalMaterial({
    color: 0xe6e9e6,
    roughness: 0.22,
    metalness: 0.88,
    clearcoat: 0.34,
    clearcoatRoughness: 0.12,
    envMap: envTexture,
    envMapIntensity: 1.58,
  }));
  const packPrimary = trackMaterial(new THREE.MeshPhysicalMaterial({
    color: 0xe6e9e6,
    roughness: 0.22,
    metalness: 0.88,
    clearcoat: 0.34,
    clearcoatRoughness: 0.12,
    envMap: envTexture,
    envMapIntensity: 1.58,
  }));
  const packSecondary = trackMaterial(new THREE.MeshPhysicalMaterial({
    color: 0x17202d,
    roughness: 0.24,
    metalness: 0.84,
    clearcoat: 0.3,
    clearcoatRoughness: 0.14,
    envMap: envTexture,
    envMapIntensity: 1.5,
  }));
  const packShadow = trackMaterial(new THREE.MeshPhysicalMaterial({
    color: 0x202832,
    roughness: 0.29,
    metalness: 0.78,
    clearcoat: 0.18,
    clearcoatRoughness: 0.2,
    envMap: envTexture,
    envMapIntensity: 1.38,
  }));
  const metal = trackMaterial(new THREE.MeshStandardMaterial({
    color: 0xa4acb1,
    roughness: 0.23,
    metalness: 0.76,
    envMap: envTexture,
    envMapIntensity: 1.45,
  }));
  const accent = trackMaterial(new THREE.MeshPhysicalMaterial({
    color: 0xf28b35,
    roughness: 0.82,
    metalness: 0.03,
    clearcoat: 0.02,
    clearcoatRoughness: 0.36,
    envMap: envTexture,
    envMapIntensity: 1.1,
  }));
  const lamp = trackMaterial(new THREE.MeshStandardMaterial({
    color: 0xffb25b,
    emissive: 0xff8a25,
    emissiveIntensity: 1.8,
    roughness: 0.16,
  }));
  const screen = trackMaterial(new THREE.MeshStandardMaterial({
    color: 0x07172b,
    emissive: 0x0b755f,
    emissiveIntensity: 0.65,
    roughness: 0.15,
  }));
  const statusGreen = trackMaterial(new THREE.MeshStandardMaterial({
    color: 0x6ee7b7,
    emissive: 0x10b981,
    emissiveIntensity: 1.15,
    roughness: 0.2,
  }));
  const statusAmber = trackMaterial(new THREE.MeshStandardMaterial({
    color: 0xf8c15c,
    emissive: 0xd97706,
    emissiveIntensity: 1.05,
    roughness: 0.22,
  }));
  const statusRed = trackMaterial(new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    emissive: 0xbe123c,
    emissiveIntensity: 0.9,
    roughness: 0.22,
  }));
  const connectorTeal = trackMaterial(new THREE.MeshStandardMaterial({
    color: 0x218f88,
    roughness: 0.32,
    metalness: 0.34,
    envMap: envTexture,
    envMapIntensity: 1.05,
  }));
  const flameMaterial = trackMaterial(new THREE.MeshBasicMaterial({
    color: 0x6de8ff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));

  const root = new THREE.Group();
  root.name = 'Anchored EVA equipment';
  const editorTargets = new Map();
  const registerEditorTarget = (object, id, options = {}) => {
    object.name = object.name || id;
    object.userData.web_id = id;
    object.userData.editorTargetId = id;
    editorTargets.set(id, { object, ...options });
  };

  // Helmet accessories sit directly on the existing helmet. No replacement visor.
  const helmetGroups = {
    classic: new THREE.Group(),
    comms: new THREE.Group(),
    explorer: new THREE.Group(),
    camera: new THREE.Group(),
    sunshield: new THREE.Group(),
  };
  Object.entries(helmetGroups).forEach(([id, group]) => {
    root.add(group);
    registerEditorTarget(group, `hw.helmet.${id}`);
  });

  const antennaBase = roundedBox(0.065, 0.045, 0.055, 0.01, darkHardware);
  antennaBase.position.set(0.195, 0.725, 0.025);
  const antenna = cylinder(0.005, 0.145, metal, 10);
  antenna.position.set(0.205, 0.82, 0.025);
  antenna.rotation.z = -0.12;
  const antennaTip = mesh(new THREE.SphereGeometry(0.014, 12, 8), accent);
  antennaTip.position.set(0.214, 0.895, 0.025);
  helmetGroups.comms.add(antennaBase, antenna, antennaTip);

  [-1, 1].forEach((side) => {
    const housing = roundedBox(0.06, 0.115, 0.052, 0.011, suitShell);
    housing.position.set(side * 0.198, 0.755, 0.115);
    housing.rotation.z = side * -0.08;
    const lenses = [-0.025, 0.025].map((offset) => {
      const lens = cylinder(0.012, 0.014, lamp, 14);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(side * 0.198, 0.755 + offset, 0.148);
      return lens;
    });
    helmetGroups.explorer.add(housing, ...lenses);
  });

  const helmetCameraBody = roundedBox(0.065, 0.105, 0.055, 0.012, suitShell);
  helmetCameraBody.position.set(-0.198, 0.755, 0.115);
  helmetCameraBody.rotation.z = 0.08;
  const helmetCameraLens = cylinder(0.02, 0.018, screen, 18);
  helmetCameraLens.rotation.x = Math.PI / 2;
  helmetCameraLens.position.set(-0.198, 0.775, 0.151);
  const helmetCameraLight = cylinder(0.012, 0.015, lamp, 14);
  helmetCameraLight.rotation.x = Math.PI / 2;
  helmetCameraLight.position.set(-0.198, 0.735, 0.151);
  helmetGroups.camera.add(helmetCameraBody, helmetCameraLens, helmetCameraLight);

  const shadeBrow = roundedBox(0.31, 0.046, 0.085, 0.014, suitShell);
  shadeBrow.position.set(0, 0.842, 0.105);
  const shadeSides = [-1, 1].map((side) => {
    const shade = roundedBox(0.045, 0.145, 0.067, 0.012, suitShell);
    shade.position.set(side * 0.19, 0.765, 0.095);
    shade.rotation.z = side * -0.1;
    return shade;
  });
  helmetGroups.sunshield.add(shadeBrow, ...shadeSides);

  // Chest modules are compact and touch the suit surface.
  const chestGroups = {
    dcm: new THREE.Group(),
    terminal: new THREE.Group(),
    camera: new THREE.Group(),
    oxygen: new THREE.Group(),
    telemetry: new THREE.Group(),
    clean: new THREE.Group(),
  };
  Object.entries(chestGroups).forEach(([id, group]) => {
    root.add(group);
    registerEditorTarget(group, `hw.chest.${id}`, { preserveColor: true });
  });

  const dcmBody = roundedBox(0.255, 0.18, 0.055, 0.018, chestPrimary);
  dcmBody.position.set(0, 0.12, 0.3);
  const dcmStrip = roundedBox(0.17, 0.034, 0.012, 0.006, darkHardware);
  dcmStrip.position.set(-0.015, 0.18, 0.333);
  const dcmDial = cylinder(0.031, 0.015, metal, 20);
  dcmDial.rotation.x = Math.PI / 2;
  dcmDial.position.set(-0.07, 0.095, 0.337);
  const dcmSelector = cylinder(0.018, 0.016, accent, 16);
  dcmSelector.rotation.x = Math.PI / 2;
  dcmSelector.position.set(0.067, 0.088, 0.338);
  const dcmPressureGauge = cylinder(0.021, 0.015, darkHardware, 18);
  dcmPressureGauge.rotation.x = Math.PI / 2;
  dcmPressureGauge.position.set(0.008, 0.095, 0.339);
  const dcmGaugeFace = cylinder(0.014, 0.017, screen, 18);
  dcmGaugeFace.rotation.x = Math.PI / 2;
  dcmGaugeFace.position.set(0.008, 0.095, 0.348);
  const dcmStatusLights = [statusGreen, statusAmber, statusRed].map((material, index) => {
    const indicator = cylinder(0.007, 0.01, material, 12);
    indicator.rotation.x = Math.PI / 2;
    indicator.position.set(0.047 + index * 0.024, 0.182, 0.341);
    return indicator;
  });
  const dcmConnectors = [
    { x: -0.075, material: connectorTeal },
    { x: 0, material: darkHardware },
    { x: 0.075, material: accent },
  ].map(({ x, material }) => {
    const connector = cylinder(0.016, 0.018, material, 14);
    connector.rotation.x = Math.PI / 2;
    connector.position.set(x, 0.035, 0.338);
    return connector;
  });
  chestGroups.dcm.add(
    dcmBody,
    dcmStrip,
    dcmDial,
    dcmSelector,
    dcmPressureGauge,
    dcmGaugeFace,
    ...dcmStatusLights,
    ...dcmConnectors
  );

  const terminalBody = roundedBox(0.25, 0.17, 0.05, 0.017, chestPrimary);
  terminalBody.position.set(0, 0.12, 0.3);
  const terminalScreen = roundedBox(0.19, 0.095, 0.012, 0.01, screen);
  terminalScreen.position.set(0, 0.135, 0.331);
  const terminalKey = roundedBox(0.055, 0.018, 0.012, 0.005, accent);
  terminalKey.position.set(0.06, 0.066, 0.332);
  chestGroups.terminal.add(terminalBody, terminalScreen, terminalKey);

  const cameraMount = roundedBox(0.19, 0.12, 0.05, 0.016, chestPrimary);
  cameraMount.position.set(0, 0.13, 0.3);
  const cameraLens = cylinder(0.045, 0.028, darkHardware, 24);
  cameraLens.rotation.x = Math.PI / 2;
  cameraLens.position.set(0, 0.13, 0.34);
  const cameraGlass = cylinder(0.028, 0.031, screen, 24);
  cameraGlass.rotation.x = Math.PI / 2;
  cameraGlass.position.set(0, 0.13, 0.35);
  chestGroups.camera.add(cameraMount, cameraLens, cameraGlass);

  // PLSS-inspired oxygen/pressure controller: gauge, guarded valve and suit ports.
  const oxygenBody = roundedBox(0.25, 0.18, 0.055, 0.018, chestPrimary);
  oxygenBody.position.set(0, 0.12, 0.3);
  const oxygenHeader = roundedBox(0.205, 0.032, 0.012, 0.006, darkHardware);
  oxygenHeader.position.set(0, 0.181, 0.334);
  const oxygenGaugeRing = cylinder(0.042, 0.018, metal, 24);
  oxygenGaugeRing.rotation.x = Math.PI / 2;
  oxygenGaugeRing.position.set(-0.057, 0.113, 0.34);
  const oxygenGaugeFace = cylinder(0.031, 0.02, screen, 24);
  oxygenGaugeFace.rotation.x = Math.PI / 2;
  oxygenGaugeFace.position.set(-0.057, 0.113, 0.35);
  const oxygenValveGuard = mesh(new THREE.TorusGeometry(0.03, 0.006, 8, 24), metal);
  oxygenValveGuard.position.set(0.064, 0.112, 0.345);
  const oxygenValve = cylinder(0.015, 0.02, accent, 14);
  oxygenValve.rotation.x = Math.PI / 2;
  oxygenValve.position.set(0.064, 0.112, 0.35);
  const oxygenIndicators = [statusGreen, statusAmber].map((material, index) => {
    const indicator = cylinder(0.008, 0.011, material, 12);
    indicator.rotation.x = Math.PI / 2;
    indicator.position.set(0.053 + index * 0.029, 0.167, 0.342);
    return indicator;
  });
  const oxygenPorts = [-1, 1].map((side) => {
    const port = cylinder(0.017, 0.018, side < 0 ? connectorTeal : darkHardware, 16);
    port.rotation.x = Math.PI / 2;
    port.position.set(side * 0.067, 0.045, 0.34);
    return port;
  });
  chestGroups.oxygen.add(
    oxygenBody,
    oxygenHeader,
    oxygenGaugeRing,
    oxygenGaugeFace,
    oxygenValveGuard,
    oxygenValve,
    ...oxygenIndicators,
    ...oxygenPorts
  );

  // Telemetry controller keeps the screen legible and the physical controls glove-sized.
  const telemetryBody = roundedBox(0.25, 0.17, 0.052, 0.017, chestPrimary);
  telemetryBody.position.set(0, 0.12, 0.3);
  const telemetryScreen = roundedBox(0.145, 0.082, 0.013, 0.009, screen);
  telemetryScreen.position.set(-0.025, 0.137, 0.335);
  const telemetryStatus = [statusGreen, statusGreen, statusAmber, statusRed].map((material, index) => {
    const indicator = cylinder(0.0065, 0.011, material, 10);
    indicator.rotation.x = Math.PI / 2;
    indicator.position.set(-0.075 + index * 0.028, 0.184, 0.34);
    return indicator;
  });
  const telemetryKnob = cylinder(0.023, 0.018, metal, 18);
  telemetryKnob.rotation.x = Math.PI / 2;
  telemetryKnob.position.set(0.087, 0.11, 0.34);
  const telemetryKey = roundedBox(0.052, 0.018, 0.014, 0.005, accent);
  telemetryKey.position.set(0.072, 0.061, 0.337);
  const telemetryPort = cylinder(0.012, 0.018, connectorTeal, 14);
  telemetryPort.rotation.x = Math.PI / 2;
  telemetryPort.position.set(-0.077, 0.059, 0.339);
  chestGroups.telemetry.add(
    telemetryBody,
    telemetryScreen,
    ...telemetryStatus,
    telemetryKnob,
    telemetryKey,
    telemetryPort
  );

  // Pack add-ons remain tight against the model's built-in PLSS.
  const packGroups = {
    standard: new THREE.Group(),
    compact: new THREE.Group(),
    explorer: new THREE.Group(),
    jetpack: new THREE.Group(),
    student: new THREE.Group(),
    minimal: new THREE.Group(),
  };
  Object.entries(packGroups).forEach(([id, group]) => {
    root.add(group);
    registerEditorTarget(group, `hw.pack.${id}`, { preserveColor: true });
  });

  const beacon = roundedBox(0.15, 0.022, 0.018, 0.006, lamp);
  beacon.position.set(0, 0.472, -0.387);
  const plssServicePanel = roundedBox(0.32, 0.31, 0.026, 0.016, packPrimary);
  plssServicePanel.position.set(0, 0.13, -0.382);
  const plssLowerPanel = roundedBox(0.21, 0.075, 0.015, 0.009, packShadow);
  plssLowerPanel.position.set(0, -0.015, -0.402);
  const plssRails = [-1, 1].map((side) => {
    const rail = roundedBox(0.032, 0.39, 0.032, 0.009, packShadow);
    rail.position.set(side * 0.19, 0.16, -0.37);
    return rail;
  });
  const plssPorts = [-1, 1].map((side) => {
    const port = cylinder(0.027, 0.018, darkHardware, 18);
    port.rotation.x = Math.PI / 2;
    port.position.set(side * 0.075, -0.07, -0.417);
    return port;
  });
  const plssOpsHousing = roundedBox(0.28, 0.075, 0.045, 0.014, packPrimary);
  plssOpsHousing.position.set(0, 0.405, -0.392);
  const plssOpsPanel = roundedBox(0.19, 0.026, 0.012, 0.006, packSecondary);
  plssOpsPanel.position.set(-0.02, 0.406, -0.422);
  const plssRegulators = [-1, 1].map((side) => {
    const regulator = cylinder(0.021, 0.017, metal, 18);
    regulator.rotation.x = Math.PI / 2;
    regulator.position.set(side * 0.105, 0.405, -0.424);
    return regulator;
  });
  const plssFanHousing = cylinder(0.047, 0.018, packShadow, 24);
  plssFanHousing.rotation.x = Math.PI / 2;
  plssFanHousing.position.set(0.075, 0.215, -0.414);
  const plssFanHub = cylinder(0.017, 0.02, metal, 16);
  plssFanHub.rotation.x = Math.PI / 2;
  plssFanHub.position.set(0.075, 0.215, -0.425);
  const plssVentSlats = [-0.027, -0.009, 0.009, 0.027].map((offset) => {
    const slat = roundedBox(0.075, 0.008, 0.012, 0.003, darkHardware);
    slat.position.set(-0.085, 0.215 + offset, -0.414);
    return slat;
  });
  const plssScrubber = roundedBox(0.085, 0.125, 0.022, 0.009, packShadow);
  plssScrubber.position.set(-0.095, 0.09, -0.413);
  const plssScrubberLatch = roundedBox(0.05, 0.014, 0.012, 0.004, metal);
  plssScrubberLatch.position.set(-0.095, 0.09, -0.43);
  const plssWaterManifold = roundedBox(0.09, 0.09, 0.022, 0.009, packShadow);
  plssWaterManifold.position.set(0.095, 0.09, -0.413);
  const plssWaterPorts = [-1, 1].map((side) => {
    const port = cylinder(0.012, 0.016, connectorTeal, 14);
    port.rotation.x = Math.PI / 2;
    port.position.set(0.095 + side * 0.025, 0.09, -0.432);
    return port;
  });
  const plssStatusLights = [statusGreen, statusAmber, statusRed].map((material, index) => {
    const indicator = cylinder(0.006, 0.01, material, 10);
    indicator.rotation.x = Math.PI / 2;
    indicator.position.set(-0.025 + index * 0.025, 0.305, -0.414);
    return indicator;
  });
  const plssAntennaBase = roundedBox(0.045, 0.045, 0.04, 0.009, darkHardware);
  plssAntennaBase.position.set(0.175, 0.405, -0.375);
  const plssAntenna = cylinder(0.0045, 0.12, metal, 9);
  plssAntenna.position.set(0.175, 0.48, -0.375);
  plssAntenna.rotation.z = -0.08;
  packGroups.standard.add(
    plssServicePanel,
    plssLowerPanel,
    ...plssRails,
    ...plssPorts,
    beacon,
    plssOpsHousing,
    plssOpsPanel,
    ...plssRegulators,
    plssFanHousing,
    plssFanHub,
    ...plssVentSlats,
    plssScrubber,
    plssScrubberLatch,
    plssWaterManifold,
    ...plssWaterPorts,
    ...plssStatusLights,
    plssAntennaBase,
    plssAntenna
  );

  const compactPanel = roundedBox(0.24, 0.24, 0.055, 0.018, packPrimary);
  compactPanel.position.set(0, 0.18, -0.37);
  const compactScreen = roundedBox(0.12, 0.055, 0.016, 0.008, screen);
  compactScreen.position.set(0, 0.2, -0.405);
  packGroups.compact.add(compactPanel, compactScreen);

  [-1, 1].forEach((side) => {
    const explorerPod = roundedBox(0.075, 0.29, 0.075, 0.018, packPrimary);
    explorerPod.position.set(side * 0.19, 0.14, -0.345);
    const explorerLight = roundedBox(0.047, 0.022, 0.018, 0.005, lamp);
    explorerLight.position.set(side * 0.19, 0.25, -0.39);
    packGroups.explorer.add(explorerPod, explorerLight);
  });

  const jetFlames = [];
  [-1, 1].forEach((side) => {
    const tank = cylinder(0.074, 0.36, packPrimary, 22);
    tank.position.set(side * 0.13, 0.15, -0.37);
    const tankBand = mesh(new THREE.TorusGeometry(0.076, 0.009, 8, 24), packSecondary);
    tankBand.rotation.x = Math.PI / 2;
    tankBand.position.set(side * 0.13, 0.15, -0.37);
    const nozzle = cylinder(0.043, 0.075, darkHardware, 18);
    nozzle.position.set(side * 0.13, -0.085, -0.37);
    const flame = mesh(new THREE.ConeGeometry(0.052, 0.24, 18), flameMaterial);
    flame.position.set(side * 0.13, -0.235, -0.37);
    flame.rotation.z = Math.PI;
    jetFlames.push(flame);
    packGroups.jetpack.add(tank, tankBand, nozzle, flame);
  });

  const studentBag = roundedBox(0.33, 0.38, 0.09, 0.035, packPrimary);
  studentBag.position.set(0, 0.16, -0.37);
  const studentPocket = roundedBox(0.22, 0.13, 0.035, 0.02, packSecondary);
  studentPocket.position.set(0, 0.08, -0.43);
  const studentBadge = cylinder(0.035, 0.012, lamp, 20);
  studentBadge.rotation.x = Math.PI / 2;
  studentBadge.position.set(0.08, 0.23, -0.425);
  packGroups.student.add(studentBag, studentPocket, studentBadge);

  // NOTE: a procedural PLSS↔chest umbilical used to live here, but as static
  // geometry it floated away from the body in bent poses (reference/sit) and
  // read as "detached" — reported repeatedly. Removed. The suit already carries
  // molded hose detail; a truly attached hose must be skinned into the mesh in
  // Blender (round-trip pipeline), not faked with a rigid overlay.

  // Sleeve decals use a transparent curved mark; the chest keeps its framed badge.
  const patchMaterials = [0, 1, 2].map(() => trackMaterial(new THREE.MeshStandardMaterial({
    transparent: true,
    alphaTest: 0.06,
    roughness: 0.72,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    side: THREE.DoubleSide,
    depthWrite: false,
  })));
  const leftPatch = mesh(createCurvedSleevePatchGeometry(0.135, 0.075), patchMaterials[0]);
  const rightPatch = mesh(createCurvedSleevePatchGeometry(0.135, 0.075), patchMaterials[1]);
  leftPatch.renderOrder = 3;
  rightPatch.renderOrder = 3;
  rig.anchors.leftSleeve.add(leftPatch);
  rig.anchors.rightSleeve.add(rightPatch);
  registerEditorTarget(leftPatch, 'hw.patch.leftSleeve', { preserveColor: true });
  registerEditorTarget(rightPatch, 'hw.patch.rightSleeve', { preserveColor: true });

  /* Chest patch grazes the suit above the module — tilted with the chest
     slope so it reads as part of the fabric, never floating or clipping. */
  const chestPatch = mesh(new THREE.PlaneGeometry(0.09, 0.055), patchMaterials[2]);
  chestPatch.position.set(0, 0.36, 0.272);
  chestPatch.rotation.x = -0.14;
  chestPatch.renderOrder = 3;
  root.add(chestPatch);
  registerEditorTarget(chestPatch, 'hw.patch.chest', { preserveColor: true });

  let currentSleevePatchTexture = null;
  let currentChestPatchTexture = null;
  let currentPatchId = null;
  let currentPatchAccent = null;
  let currentConfig = null;

  function setPatch(id, accentHex) {
    if (currentPatchId === id && currentPatchAccent === accentHex) return;
    currentPatchId = id;
    currentPatchAccent = accentHex;
    [currentSleevePatchTexture, currentChestPatchTexture].forEach((texture) => {
      if (!texture) return;
      textures.delete(texture);
      texture.dispose();
    });
    currentSleevePatchTexture = null;
    currentChestPatchTexture = null;
    if (id !== 'none') {
      currentSleevePatchTexture = createPatchTexture(id, accentHex, true);
      currentChestPatchTexture = createPatchTexture(id, accentHex);
      textures.add(currentSleevePatchTexture);
      textures.add(currentChestPatchTexture);
    }
    patchMaterials.forEach((material, index) => {
      material.map = index < 2 ? currentSleevePatchTexture : currentChestPatchTexture;
      material.needsUpdate = true;
    });
    leftPatch.visible = id !== 'none';
    rightPatch.visible = id !== 'none';
    chestPatch.visible = id !== 'none';
  }

  function setConfig(config, colors) {
    currentConfig = config;
    const suitFinish = SUIT_FINISH_BY_ID.get(config.suitFinish)
      || SUIT_FINISH_BY_ID.get('standard');
    const accentFinish = ACCENT_FINISH_BY_ID.get(config.accentFinish)
      || ACCENT_FINISH_BY_ID.get('matte');
    suitShell.color.setHex(colors.suit);
    suitShell.roughness = suitFinish.roughness;
    suitShell.metalness = suitFinish.metalness;
    suitShell.clearcoat = suitFinish.clearcoat;
    suitShell.clearcoatRoughness = Math.max(0.025, suitFinish.roughness * 0.45);
    chestPrimary.color.setHex(colors.chestColor);
    packPrimary.color.setHex(colors.packPrimary);
    packSecondary.color.setHex(colors.packSecondary);
    packShadow.color.setHex(colors.packShadow);
    accent.color.setHex(colors.accent);
    accent.roughness = accentFinish.roughness;
    accent.metalness = accentFinish.metalness;
    accent.clearcoat = accentFinish.clearcoat;
    accent.clearcoatRoughness = Math.max(0.025, accentFinish.roughness * 0.42);
    accent.envMapIntensity = 1.05 + accentFinish.metalness * 0.8;
    lamp.color.setHex(colors.accent).lerp(new THREE.Color(0xffd38a), 0.35);
    lamp.emissive.setHex(colors.accent);

    Object.entries(helmetGroups).forEach(([id, group]) => { group.visible = id === config.helmet; });
    Object.entries(packGroups).forEach(([id, group]) => { group.visible = id === config.pack; });
    Object.entries(chestGroups).forEach(([id, group]) => { group.visible = id === config.chest; });

    setPatch(config.logo, colors.accent);
  }

  function update(time) {
    lamp.emissiveIntensity = 1.55 + Math.sin(time * 2.5) * 0.35;
    const jetActive = currentConfig?.pack === 'jetpack';
    jetFlames.forEach((flame, index) => {
      flame.visible = jetActive;
      const flicker = 0.82 + Math.sin(time * 13 + index * 2.1) * 0.16;
      flame.scale.set(1, flicker, 1);
      flame.material.opacity = 0.66 + flicker * 0.16;
    });
  }

  return { root, setConfig, update, lamp, editorTargets };
}
