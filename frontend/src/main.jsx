import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false, diagnostic: '' } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { this.setState({ diagnostic: error?.stack || error?.message || String(error) }) }
  render() {
    if (this.state.failed) {
      const currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('greig-locale')) || (typeof document !== 'undefined' && document.documentElement.lang) || 'kz'
      const err = {
        kz: { eyebrow: 'ГРЕЙГ · ЦИФРЛЫҚ ШЕЖІРЕ', title: 'Бұл бетті жүктеу мүмкін болмады', desc: 'Парақты қайта ашып көріңіз.', reload: 'Қайта жүктеу' },
        ru: { eyebrow: 'ГРЕЙГ · ЦИФРОВАЯ ЛЕТОПИСЬ', title: 'Не удалось загрузить страницу', desc: 'Пожалуйста, перезагрузите страницу.', reload: 'Перезагрузить' },
        en: { eyebrow: 'GREIGII · DIGITAL CHRONICLE', title: 'The page could not be rendered', desc: 'Please reload the page to try again.', reload: 'Reload' },
      }[currentLang.startsWith('ru') ? 'ru' : currentLang.startsWith('en') ? 'en' : 'kz']
      return <main className="app-error"><p className="eyebrow">{err.eyebrow}</p><h1>{err.title}</h1><p>{err.desc}</p>{import.meta.env.DEV && <pre>{this.state.diagnostic}</pre>}<button className="button button-outline" onClick={() => window.location.reload()}>{err.reload}</button></main>
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary><BrowserRouter><App /></BrowserRouter></AppErrorBoundary>
  </React.StrictMode>,
)
