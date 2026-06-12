import { getConfig, setConfig } from './db'

// Cliente mínimo para la API de mensajes de Anthropic.
//
// SEGURIDAD SOBRE LA API KEY:
//  - La key NO está embebida en el código.
//  - Se lee de IndexedDB (config 'apiKey'), que el usuario introduce en Ajustes,
//    o de la variable de entorno VITE_ANTHROPIC_API_KEY si se define al compilar.
//  - Advertencia: llamar a la API desde el navegador expone la key a quien use
//    este dispositivo/navegador. Para uso personal local es aceptable; para
//    distribución pública, enruta a través de un proxy propio (ver README).

const DEFAULT_MODEL = 'claude-sonnet-4-6'
const API_URL = 'https://api.anthropic.com/v1/messages'
const ENV_KEY = import.meta.env?.VITE_ANTHROPIC_API_KEY || ''
const ENV_PROXY = import.meta.env?.VITE_API_PROXY_URL || ''

export async function getApiKey() {
  const stored = await getConfig('apiKey', '')
  return stored || ENV_KEY || ''
}
export async function setApiKey(key) {
  return setConfig('apiKey', key || '')
}
export async function getModelo() {
  return getConfig('modelo', DEFAULT_MODEL)
}
export async function setModelo(m) {
  return setConfig('modelo', m || DEFAULT_MODEL)
}
export async function getProxyUrl() {
  const stored = await getConfig('proxyUrl', '')
  return stored || ENV_PROXY || ''
}
export async function setProxyUrl(u) {
  return setConfig('proxyUrl', u || '')
}

export async function hayConexion() {
  const proxy = await getProxyUrl()
  if (proxy) return true
  const key = await getApiKey()
  return Boolean(key)
}

/**
 * Envía una conversación a Claude.
 * @param {object} opts
 * @param {string} opts.system  - prompt de sistema
 * @param {Array<{role:'user'|'assistant',content:string}>} opts.messages
 * @param {number} [opts.maxTokens]
 * @param {number} [opts.temperature]
 * @returns {Promise<string>} texto de la respuesta
 */
export async function enviarMensaje({ system, messages, maxTokens = 1024, temperature = 0.7 }) {
  const proxy = await getProxyUrl()
  const modelo = await getModelo()
  const body = { model: modelo, max_tokens: maxTokens, temperature, system, messages }

  // Opción A (recomendada para distribución): proxy propio que guarda la key en el servidor.
  if (proxy) {
    const res = await fetch(proxy, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Proxy respondió ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return extraerTexto(data)
  }

  // Opción B (uso personal local): llamada directa con la key del dispositivo.
  const key = await getApiKey()
  if (!key) {
    throw new Error(
      'No hay forma de conectar con la IA. Agrega tu clave de Anthropic en Ajustes, o configura un proxy.',
    )
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      // Permite la llamada directa desde el navegador (CORS de Anthropic).
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`La API respondió ${res.status}. ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return extraerTexto(data)
}

function extraerTexto(data) {
  if (!data?.content) return ''
  return data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}

export { DEFAULT_MODEL }
