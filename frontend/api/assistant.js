import { getAssistantConfig, handleAssistantRequest } from '../server/assistantHandler.js'

export const config = {
  maxDuration: 30,
}

export default async function handler(req, res) {
  await handleAssistantRequest(req, res, getAssistantConfig(process.env))
}
