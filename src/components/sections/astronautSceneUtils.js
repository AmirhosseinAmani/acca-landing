import * as THREE from 'three';

const TAU = Math.PI * 2;

export function createStudioReflectionTexture(darkMode) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  const sky = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  sky.addColorStop(0, darkMode ? '#111a34' : '#eef5ff');
  sky.addColorStop(0.34, darkMode ? '#526483' : '#d6e2f1');
  sky.addColorStop(0.58, darkMode ? '#f7ead8' : '#fff2dc');
  sky.addColorStop(1, darkMode ? '#0a1020' : '#8b94a6');
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.globalCompositeOperation = 'screen';
  context.filter = 'blur(18px)';
  for (let index = 0; index < 8; index += 1) {
    context.beginPath();
    context.ellipse(
      520 + index * 16,
      250 - index * 18,
      210 - index * 8,
      46 + index * 3,
      -0.56,
      0,
      TAU
    );
    context.strokeStyle = `rgba(255, ${236 - index * 6}, ${211 - index * 10}, ${0.26 - index * 0.014})`;
    context.lineWidth = 22 - index;
    context.stroke();
  }
  context.beginPath();
  context.ellipse(336, 132, 160, 52, -0.32, 0, TAU);
  context.fillStyle = 'rgba(255,255,255,0.74)';
  context.fill();
  context.beginPath();
  context.ellipse(760, 126, 190, 42, 0.48, 0, TAU);
  context.fillStyle = darkMode ? 'rgba(126,164,255,0.32)' : 'rgba(133,163,218,0.30)';
  context.fill();
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  return texture;
}
