import { useEffect, useRef, useState } from 'react'
import { Flower2, Send, Sparkles, Trash2, X } from 'lucide-react'
import { useLocale } from '../locales/context.js'
import './AiAssistant.css'

function errorText(t, code) {
  if (code === 'missing_key') return t.assistant.missingKey
  if (code === 'rate_limited') return t.assistant.rateLimited
  return t.assistant.error
}

async function readAssistantStream(response, onDelta) {
  if (!response.body) {
    const data = await response.json().catch(() => ({}))
    throw Object.assign(new Error(data.error || 'openai_error'), { code: data.error || 'openai_error' })
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''

    for (const chunk of chunks) {
      const line = chunk.split('\n').find(item => item.startsWith('data:'))
      if (!line) continue
      const raw = line.replace(/^data:\s*/, '').trim()
      if (!raw) continue
      let payload
      try {
        payload = JSON.parse(raw)
      } catch {
        continue
      }
      if (payload.delta) {
        full += payload.delta
        onDelta(full)
      }
    }
  }

  return full.trim()
}

export function AiAssistant() {
  const { lang, t } = useLocale()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    const node = listRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, streaming, open, error])

  useEffect(() => {
    if (!open) return undefined
    const onKey = event => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const id = window.setTimeout(() => inputRef.current?.focus(), 180)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(id)
    }
  }, [open])

  useEffect(() => {
    document.body.classList.toggle('ai-assistant-open', open)
    return () => document.body.classList.remove('ai-assistant-open')
  }, [open])

  useEffect(() => () => abortRef.current?.abort(), [])

  const send = async text => {
    const content = text.trim()
    if (!content || busy) return

    const history = [...messages, { role: 'user', content }]
    setMessages(history)
    setInput('')
    setBusy(true)
    setError('')
    setStreaming('')
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          lang,
          messages: history.map(item => ({ role: item.role, content: item.content })),
        }),
      })

      const contentType = response.headers.get('content-type') || ''
      if (!response.ok || contentType.includes('application/json')) {
        const data = await response.json().catch(() => ({}))
        throw Object.assign(new Error(data.error || 'openai_error'), { code: data.error || 'openai_error' })
      }

      const reply = await readAssistantStream(response, setStreaming)
      if (!reply) throw Object.assign(new Error('openai_error'), { code: 'openai_error' })
      setMessages([...history, { role: 'assistant', content: reply }])
      setStreaming('')
    } catch (err) {
      if (err?.name === 'AbortError') return
      setStreaming('')
      setError(err?.code || 'openai_error')
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = event => {
    event.preventDefault()
    send(input)
  }

  const clearChat = () => {
    abortRef.current?.abort()
    setMessages([])
    setStreaming('')
    setError('')
    setBusy(false)
    inputRef.current?.focus()
  }

  const copy = t.assistant

  return (
    <>
      <button
        type="button"
        className={`ai-assistant-tab ${open ? 'is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label={copy.open}
        aria-expanded={open}
      >
        <Sparkles size={16} />
        <span>{copy.tab}</span>
      </button>

      <aside className={`ai-assistant-panel ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label={copy.title}>
        <header className="ai-assistant-head">
          <div className="ai-assistant-brand">
            <span className="ai-assistant-mark" aria-hidden="true"><Flower2 size={18} /></span>
            <div>
              <strong>{copy.title}</strong>
              <small>{copy.subtitle}</small>
            </div>
          </div>
          <div className="ai-assistant-head-actions">
            {messages.length > 0 && (
              <button type="button" onClick={clearChat} aria-label={copy.clear} title={copy.clear}>
                <Trash2 size={16} />
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label={copy.close}>
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="ai-assistant-thread" ref={listRef} role="log" aria-live="polite">
          <div className="ai-assistant-bubble ai-assistant-bubble-bot">
            <span className="ai-assistant-who">{copy.title}</span>
            <p>{copy.greet}</p>
          </div>

          {messages.length === 0 && (
            <div className="ai-assistant-suggestions">
              {copy.suggestions.map(prompt => (
                <button key={prompt} type="button" onClick={() => send(prompt)} disabled={busy}>
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`ai-assistant-bubble ai-assistant-bubble-${item.role === 'user' ? 'user' : 'bot'}`}>
              <span className="ai-assistant-who">{item.role === 'user' ? copy.you : copy.title}</span>
              <p>{item.content}</p>
            </div>
          ))}

          {streaming && (
            <div className="ai-assistant-bubble ai-assistant-bubble-bot is-streaming">
              <span className="ai-assistant-who">{copy.title}</span>
              <p>{streaming}</p>
            </div>
          )}

          {busy && !streaming && (
            <div className="ai-assistant-bubble ai-assistant-bubble-bot is-thinking">
              <span className="ai-assistant-who">{copy.title}</span>
              <p>{copy.thinking}</p>
            </div>
          )}

          {error && <p className="ai-assistant-error">{errorText(t, error)}</p>}
        </div>

        <form className="ai-assistant-composer" onSubmit={onSubmit}>
          <label className="ai-assistant-field">
            <span className="visually-hidden">{copy.placeholder}</span>
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              disabled={busy}
              placeholder={copy.placeholder}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  send(input)
                }
              }}
            />
          </label>
          <button type="submit" className="ai-assistant-send" disabled={busy || !input.trim()} aria-label={copy.send}>
            <Send size={16} />
          </button>
        </form>
        <p className="ai-assistant-note">{copy.disclaimer}</p>
      </aside>
    </>
  )
}
