import { MUSEUM_KNOWLEDGE } from './assistantKnowledge.js'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MAX_MESSAGES = 12
const MAX_CHARS = 1600
const ALLOWED_LANGS = new Set(['kz', 'ru', 'en'])

export function getAssistantConfig(env = process.env) {
  return {
    apiKey: env.OPENAI_API_KEY || '',
    model: env.OPENAI_MODEL || 'gpt-4o-mini',
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      resolve(req.body)
      return
    }
    if (typeof req.body === 'string') {
      try {
        resolve(req.body ? JSON.parse(req.body) : {})
      } catch (error) {
        reject(error)
      }
      return
    }

    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

function buildMessages(body) {
  const lang = ALLOWED_LANGS.has(body?.lang) ? body.lang : 'kz'
  const incoming = Array.isArray(body?.messages) ? body.messages : []
  const history = incoming
    .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .map(item => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_CHARS),
    }))
    .filter(item => item.content)
    .slice(-MAX_MESSAGES)

  if (!history.length || history[history.length - 1].role !== 'user') {
    return { error: 'invalid_request' }
  }

  const languageLine = {
    kz: 'Reply entirely in Kazakh.',
    ru: 'Reply entirely in Russian.',
    en: 'Reply entirely in English.',
  }[lang]

  return {
    lang,
    messages: [
      { role: 'system', content: `${MUSEUM_KNOWLEDGE}\n\n${languageLine}` },
      ...history,
    ],
  }
}

async function pipeOpenAIStream(openaiResponse, res) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  if (typeof res.flushHeaders === 'function') res.flushHeaders()

  const reader = openaiResponse.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let sentText = false

  const emit = payload => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data) continue
      if (data === '[DONE]') {
        emit({ done: true })
        res.end()
        return
      }
      try {
        const parsed = JSON.parse(data)
        const delta = parsed?.choices?.[0]?.delta?.content
        if (delta) {
          sentText = true
          emit({ delta })
        }
      } catch {
        /* skip malformed SSE chunks */
      }
    }
  }

  emit({ done: true })
  if (!sentText) {
    /* still close cleanly; the client will show a generic error if content is empty */
  }
  res.end()
}

export async function handleAssistantRequest(req, res, config) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  const apiKey = config?.apiKey
  if (!apiKey) {
    sendJson(res, 503, { error: 'missing_key' })
    return
  }

  let body
  try {
    body = await readJson(req)
  } catch {
    sendJson(res, 400, { error: 'invalid_request' })
    return
  }

  const prepared = buildMessages(body)
  if (prepared.error) {
    sendJson(res, 400, { error: prepared.error })
    return
  }

  let openaiResponse
  try {
    openaiResponse = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        stream: true,
        temperature: 0.4,
        max_tokens: 700,
        messages: prepared.messages,
      }),
    })
  } catch {
    sendJson(res, 502, { error: 'openai_error' })
    return
  }

  if (!openaiResponse.ok) {
    const status = openaiResponse.status === 429 ? 429 : 502
    const error = openaiResponse.status === 429 ? 'rate_limited' : openaiResponse.status === 401 ? 'missing_key' : 'openai_error'
    sendJson(res, status, { error })
    return
  }

  try {
    await pipeOpenAIStream(openaiResponse, res)
  } catch {
    if (!res.headersSent) sendJson(res, 502, { error: 'openai_error' })
    else res.end()
  }
}

export function createAssistantMiddleware(getConfig) {
  return (req, res, next) => {
    const url = req.url?.split('?')[0]
    if (url !== '/api/assistant') {
      next()
      return
    }
    handleAssistantRequest(req, res, getConfig()).catch(() => {
      if (!res.headersSent) sendJson(res, 500, { error: 'openai_error' })
    })
  }
}
