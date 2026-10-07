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
    if (this.state.failed) return <main className="app-error"><p className="eyebrow">GREIGII · DIGITAL CHRONICLE</p><h1>Бұл бетті жүктеу мүмкін болмады</h1><p>Парақты қайта ашып көріңіз. The page could not be rendered. Reload to try again.</p>{import.meta.env.DEV && <pre>{this.state.diagnostic}</pre>}<button className="button button-outline" onClick={() => window.location.reload()}>Қайта жүктеу · Reload</button></main>
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary><BrowserRouter><App /></BrowserRouter></AppErrorBoundary>
  </React.StrictMode>,
)
