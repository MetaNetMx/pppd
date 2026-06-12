// KV mínimo sobre Upstash Redis REST (o Vercel KV, que es compatible).
// Lee credenciales de KV_REST_API_URL/KV_REST_API_TOKEN o UPSTASH_REDIS_REST_URL/TOKEN.
// Si no hay credenciales, kvDisponible() es false y el backend de push hace no-op.

const URL_BASE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''

export function kvDisponible() {
  return Boolean(URL_BASE && TOKEN)
}

async function comando(args) {
  const res = await fetch(URL_BASE, {
    method: 'POST',
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`KV ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.result
}

export async function kvGetJSON(key, fallback = null) {
  const r = await comando(['GET', key])
  if (r == null) return fallback
  try {
    return JSON.parse(r)
  } catch {
    return fallback
  }
}

export async function kvSetJSON(key, value) {
  return comando(['SET', key, JSON.stringify(value)])
}
