import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false, diagnostic: '' }
  }

  static getDerivedStateFromError(error) {
    return { failed: true, diagnostic: error?.stack || error?.message || String(error) }
  }

  componentDidCatch(error) {
    this.setState({ diagnostic: error?.stack || error?.message || String(error) })
    console.error('AppErrorBoundary caught:', error)
  }

  render() {
    if (this.state.failed) {
      let currentLang = 'kz'
      try {
        currentLang =
          (typeof localStorage !== 'undefined' && localStorage.getItem('greig-locale')) ||
          (typeof document !== 'undefined' && document.documentElement.lang) ||
          'kz'
      } catch {
        currentLang = 'kz'
      }

      const err = {
        kz: {
          eyebrow: 'ГРЕЙГ · ЦИФРЛЫҚ ШЕЖІРЕ',
          title: 'Бұл бетті жүктеу мүмкін болмады',
          desc: 'Парақты қайта ашып көріңіз.',
          reload: 'Қайта жүктеу',
          details: 'Техникалық мәліметтер',
        },
        ru: {
          eyebrow: 'ГРЕЙГ · ЦИФРОВАЯ ЛЕТОПИСЬ',
          title: 'Не удалось загрузить страницу',
          desc: 'Пожалуйста, перезагрузите страницу.',
          reload: 'Перезагрузить',
          details: 'Технические подробности',
        },
        en: {
          eyebrow: 'GREIGII · DIGITAL CHRONICLE',
          title: 'The page could not be rendered',
          desc: 'Please reload the page to try again.',
          reload: 'Reload',
          details: 'Technical details',
        },
      }[currentLang.startsWith('ru') ? 'ru' : currentLang.startsWith('en') ? 'en' : 'kz']

      return (
        <main className="app-error">
          <p className="eyebrow">{err.eyebrow}</p>
          <h1>{err.title}</h1>
          <p>{err.desc}</p>
          {this.state.diagnostic && (
            <details
              style={{
                margin: '16px auto',
                textAlign: 'left',
                maxWidth: '640px',
                background: '#f8f4ee',
                border: '1px solid #e2d9cd',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{err.details}</summary>
              <pre
                style={{
                  marginTop: '8px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontSize: '11px',
                  color: '#b42318',
                }}
              >
                {this.state.diagnostic}
              </pre>
            </details>
          )}
          <button className="button button-outline" onClick={() => window.location.reload()}>
            {err.reload}
          </button>
        </main>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>,
)
