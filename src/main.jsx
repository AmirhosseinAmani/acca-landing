import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { registerServiceWorker } from './registerServiceWorker'
import { initScrollRestoration } from './lib/scrollRestoration'
import { initAnalytics } from './lib/analytics'

initScrollRestoration()
initAnalytics()

/** Catches unexpected component errors so the whole page never goes blank. */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[ACCA EDU] Uncaught error:', error, info); }
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
