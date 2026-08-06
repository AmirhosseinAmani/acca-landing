import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { registerServiceWorker } from './registerServiceWorker'
import { initAnalytics } from './lib/analytics'
import { initScrollRestoration } from './lib/scrollRestoration'

initScrollRestoration()
initAnalytics()

// Auto-recover from stale-deploy chunk failures. When a new build ships, an old
// cached index.html / service worker can point at a chunk hash that no longer
// exists, so a dynamic import fails ("Failed to fetch dynamically imported
// module"). Clear the service worker + caches and reload ONCE (guarded against
// loops) so the user lands on the fresh build instead of an error screen.
function isChunkLoadError(message) {
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i.test(String(message || ''));
}
let recovering = false;
async function recoverFromStaleDeploy() {
  if (recovering) return;
  try {
    if (sessionStorage.getItem('acca-chunk-recovered')) return;
    sessionStorage.setItem('acca-chunk-recovered', '1');
  } catch { /* private mode */ }
  recovering = true;
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch { /* best effort */ }
  window.location.reload();
}
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => { event.preventDefault?.(); recoverFromStaleDeploy(); });
  window.addEventListener('error', (event) => { if (isChunkLoadError(event?.message)) recoverFromStaleDeploy(); });
  window.addEventListener('unhandledrejection', (event) => { if (isChunkLoadError(event?.reason?.message || event?.reason)) recoverFromStaleDeploy(); });
}

/** Catches unexpected component errors so the whole page never goes blank. */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    console.error('[ACCA EDU] Uncaught error:', error, info);
    if (isChunkLoadError(error?.message)) recoverFromStaleDeploy();
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily: 'Vazirmatn, sans-serif', textAlign: 'center', padding: '60px 24px',
          background: '#071A3D', color: '#fffaf0', minHeight: '100vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>ACCA EDU</h1>
          <p>یک خطای غیرمنتظره رخ داد. لطفاً صفحه را رفرش کنید.</p>
          <p style={{ marginTop: 8 }}>An unexpected error occurred. Please refresh the page.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: 24, padding: '12px 28px', background: '#C6A768', color: '#071A3D', border: 'none', borderRadius: 999, fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}
          >
            Refresh / رفرش
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
registerServiceWorker()
