// Función serverless (Vercel) que reenvía el chat a la API de Anthropic.
// La clave vive SOLO en el servidor (variable de entorno ANTHROPIC_API_KEY).
// El cliente apunta aquí con VITE_API_PROXY_URL=/api/chat (sin exponer ninguna clave).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    res.status(500).json({ error: 'Falta ANTHROPIC_API_KEY en el servidor.' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-6',
        max_tokens: body.max_tokens ?? 1024,
        temperature: body.temperature ?? 0.7,
        system: body.system,
        messages: body.messages || [],
      }),
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
