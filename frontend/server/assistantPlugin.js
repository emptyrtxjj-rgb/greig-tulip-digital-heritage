import { createAssistantMiddleware } from './assistantHandler.js'

export function assistantPlugin(getConfig) {
  const attach = server => {
    server.middlewares.use(createAssistantMiddleware(getConfig))
  }

  return {
    name: 'greig-openai-assistant',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}
