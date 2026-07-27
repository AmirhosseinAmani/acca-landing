import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { DEFAULT_ASTRONAUT_CONFIG } from '../../lib/astronautConfig';

const HeroAstronautMainThreadScene = lazy(() => import('./HeroAstronautMainThreadScene'));

function supportsWorkerRendering() {
  return (
    typeof window !== 'undefined'
    && typeof Worker !== 'undefined'
    && typeof OffscreenCanvas !== 'undefined'
    && typeof HTMLCanvasElement !== 'undefined'
    && 'transferControlToOffscreen' in HTMLCanvasElement.prototype
  );
}

function AstronautFallback({ darkMode, config, fallbackSrc, fallbackAlt }) {
  return (
    <Suspense fallback={<div className="hero-astronaut-loader" aria-hidden="true" />}>
      <HeroAstronautMainThreadScene
        darkMode={darkMode}
        config={config}
        fallbackSrc={fallbackSrc}
        fallbackAlt={fallbackAlt}
      />
    </Suspense>
  );
}

function WorkerAstronautScene({
  darkMode,
  config,
  fallbackSrc,
  fallbackAlt,
}) {
  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  const configRef = useRef(config);
  const initialDarkModeRef = useRef(darkMode);
  const [modelReady, setModelReady] = useState(false);
  const [workerFailed, setWorkerFailed] = useState(false);

  useEffect(() => {
    configRef.current = config;
    workerRef.current?.postMessage({ type: 'config', config });
  }, [config]);

  useEffect(() => {
    workerRef.current?.postMessage({ type: 'theme', darkMode });
  }, [darkMode]);

  useEffect(() => {
    if (workerFailed) return undefined;
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    let disposed = false;
    let worker;
    let resizeObserver;
    let visibilityObserver;
    const interaction = {
      dragging: false,
      pointerId: null,
      lastX: 0,
    };

    try {
      const offscreen = canvas.transferControlToOffscreen();
      worker = new Worker(new URL('./heroAstronaut.worker.js', import.meta.url), {
        type: 'module',
        name: 'acca-hero-astronaut',
      });
      workerRef.current = worker;

      const width = Math.max(1, Math.round(container.clientWidth));
      const height = Math.max(1, Math.round(container.clientHeight));
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const params = new URLSearchParams(window.location.search);
      const preferProduction = (
        params.get('astroModel') || window.localStorage.getItem('acca-astronaut-model')
      ) === 'production';

      worker.postMessage({
        type: 'init',
        canvas: offscreen,
        width,
        height,
        dpr: Math.min(window.devicePixelRatio || 1, 1.65),
        darkMode: initialDarkModeRef.current,
        config: configRef.current,
        reduceMotion,
        preferProduction,
      }, [offscreen]);
    } catch {
      queueMicrotask(() => {
        if (!disposed) setWorkerFailed(true);
      });
      return undefined;
    }

    worker.onmessage = (event) => {
      if (disposed) return;
      if (event.data?.type === 'ready') setModelReady(true);
      if (event.data?.type === 'error') setWorkerFailed(true);
    };
    worker.onerror = () => {
      if (!disposed) setWorkerFailed(true);
    };

    const postResize = () => {
      if (!workerRef.current) return;
      workerRef.current.postMessage({
        type: 'resize',
        width: Math.max(1, Math.round(container.clientWidth)),
        height: Math.max(1, Math.round(container.clientHeight)),
        dpr: Math.min(window.devicePixelRatio || 1, 1.65),
      });
    };
    resizeObserver = new ResizeObserver(postResize);
    resizeObserver.observe(container);

    const setActive = (active) => {
      workerRef.current?.postMessage({
        type: 'active',
        active: active && document.visibilityState !== 'hidden',
      });
    };
    visibilityObserver = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '120px' }
    );
    visibilityObserver.observe(container);

    const handleVisibility = () => {
      const visible = container.getBoundingClientRect().bottom >= -120
        && container.getBoundingClientRect().top <= window.innerHeight + 120;
      setActive(visible);
    };

    const handlePointerDown = (event) => {
      interaction.dragging = true;
      interaction.pointerId = event.pointerId;
      interaction.lastX = event.clientX;
      canvas.classList.add('is-dragging');
      canvas.setPointerCapture?.(event.pointerId);
      if (event.pointerType === 'mouse') event.preventDefault();
    };

    const handlePointerMove = (event) => {
      if (!interaction.dragging || interaction.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - interaction.lastX;
      interaction.lastX = event.clientX;
      workerRef.current?.postMessage({ type: 'rotate', deltaX });
    };

    const handlePointerUp = (event) => {
      if (interaction.pointerId !== event.pointerId) return;
      interaction.dragging = false;
      interaction.pointerId = null;
      canvas.classList.remove('is-dragging');
      canvas.releasePointerCapture?.(event.pointerId);
    };

    const handleDoubleClick = () => {
      workerRef.current?.postMessage({ type: 'reset-rotation' });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      worker.postMessage({ type: 'dispose' });
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };
  }, [workerFailed]);

  if (workerFailed) {
    return (
      <AstronautFallback
        darkMode={darkMode}
        config={config}
        fallbackSrc={fallbackSrc}
        fallbackAlt={fallbackAlt}
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

/** Keeps the full 3D experience while moving model setup and WebGL off the UI thread. */
export default function HeroAstronautScene({
  darkMode = false,
  config = DEFAULT_ASTRONAUT_CONFIG,
  fallbackSrc = null,
  fallbackAlt = '',
}) {
  if (!supportsWorkerRendering()) {
    return (
      <AstronautFallback
        darkMode={darkMode}
        config={config}
        fallbackSrc={fallbackSrc}
        fallbackAlt={fallbackAlt}
      />
    );
  }

  return (
    <WorkerAstronautScene
      darkMode={darkMode}
      config={config}
      fallbackSrc={fallbackSrc}
      fallbackAlt={fallbackAlt}
    />
  );
}
