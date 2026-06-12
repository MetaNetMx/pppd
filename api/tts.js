// Función serverless (Vercel) de TTS neuronal. La clave del proveedor vive SOLO en el
// servidor. El cliente apunta aquí con el endpoint /api/tts (sin exponer claves).
//
// Elige proveedor con la variable de entorno TTS_PROVIDER:
//   azure       -> es-MX real (es-MX-DaliaNeural / es-MX-JorgeNeural). Recomendado.
//   elevenlabs  -> multilingüe de alta calidad (requiere voiceId).
//   openai      -> sencillo, voces multilingües.
//
// Contrato (lo que envía el cliente):
//   POST body JSON { text, voice?, lang? }  ->  responde bytes de audio (audio/mpeg)

const PROVIDER = process.env.TTS_PROVIDER || 'azure'

function escaparXml(s = '') {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c],
  )
}

async function azure(text, voice) {
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  if (!key || !region) throw new Error('Faltan AZURE_SPEECH_KEY / AZURE_SPEECH_REGION.')
  const v = voice || 'es-MX-DaliaNeural'
  const ssml = `<speak version="1.0" xml:lang="es-MX"><voice name="${v}"><prosody rate="-8%">${escaparXml(
    text,
  )}</prosody></voice></speak>`
  const r = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'ruta-calma',
      },
      body: ssml,
    },
  )
  if (!r.ok) throw new Error(`Azure TTS ${r.status}: ${await r.text()}`)
  return Buffer.from(await r.arrayBuffer())
}

async function elevenlabs(text, voice) {
  const key = process.env.ELEVENLABS_API_KEY
  const voiceId = voice || process.env.ELEVENLABS_VOICE_ID
  if (!key || !voiceId) throw new Error('Faltan ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID.')
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`)
  return Buffer.from(await r.arrayBuffer())
}

async function openai(text, voice) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Falta OPENAI_API_KEY.')
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: voice || 'alloy', input: text }),
  })
  if (!r.ok) throw new Error(`OpenAI TTS ${r.status}: ${await r.text()}`)
  return Buffer.from(await r.arrayBuffer())
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const text = (body?.text || '').slice(0, 2000)
    if (!text) {
      res.status(400).json({ error: 'Falta "text".' })
      return
    }
    const fn = PROVIDER === 'elevenlabs' ? elevenlabs : PROVIDER === 'openai' ? openai : azure
    const audio = await fn(text, body?.voice)
    res.setHeader('content-type', 'audio/mpeg')
    res.setHeader('cache-control', 'no-store')
    res.status(200).send(audio)
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
