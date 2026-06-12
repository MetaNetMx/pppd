import { getConfig, setConfig } from './db'
import { elegirVoz, hablar, detenerVoz } from './util'

// Capa de TTS configurable. Por defecto usa la voz del navegador (Web Speech API).
// Si configuras un endpoint de TTS neuronal (es-MX), la app lo usa en su lugar.
//
// CONTRATO DEL ENDPOINT (para que conectes el proveedor que prefieras vía proxy):
//   POST <ttsEndpoint>
//   body JSON: { "text": "<frase>", "voice": "<voz opcional>", "lang": "es-MX" }
//   headers: si configuras ttsApiKey, se envía como "Authorization: Bearer <key>"
//   respuesta: bytes de audio (audio/mpeg, audio/wav, etc.). La app los reproduce.
// Así puedes apuntar a un proxy propio sobre ElevenLabs, Google, Azure, OpenAI, etc.,
// sin exponer la clave del proveedor en el cliente (recomendado).

const ENV_TTS_ENDPOINT = import.meta.env?.VITE_TTS_ENDPOINT || ''
const ENV_TTS_VOICE = import.meta.env?.VITE_TTS_VOICE || ''

export async function getTtsConfig() {
  return {
    endpoint: (await getConfig('ttsEndpoint', '')) || ENV_TTS_ENDPOINT || '',
    apiKey: (await getConfig('ttsApiKey', '')) || '',
    voz: (await getConfig('ttsVoz', '')) || ENV_TTS_VOICE || '',
  }
}
export async function setTtsConfig({ endpoint, apiKey, voz }) {
  await setConfig('ttsEndpoint', endpoint || '')
  await setConfig('ttsApiKey', apiKey || '')
  await setConfig('ttsVoz', voz || '')
}

export async function ttsNeuronalActivo() {
  return Boolean((await getConfig('ttsEndpoint', '')) || ENV_TTS_ENDPOINT)
}

// Sintetiza una frase con el endpoint neuronal y devuelve una URL de objeto de audio.
export async function sintetizarUrl(texto) {
  const { endpoint, apiKey, voz } = await getTtsConfig()
  if (!endpoint) throw new Error('Sin endpoint de TTS neuronal configurado.')
  const headers = { 'content-type': 'application/json' }
  if (apiKey) headers['authorization'] = `Bearer ${apiKey}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text: texto, voice: voz || undefined, lang: 'es-MX' }),
  })
  if (!res.ok) throw new Error(`TTS respondió ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// Locutor unificado: reproduce una lista de segmentos [{texto, pausa}] de forma
// secuencial respetando los silencios. Usa TTS neuronal si está configurado;
// si no, o si falla, cae a la voz del navegador.
export function crearLocutor() {
  let cancelado = false
  let audioActual = null
  let timer = null
  let urlActual = null

  function limpiarUrl() {
    if (urlActual) {
      URL.revokeObjectURL(urlActual)
      urlActual = null
    }
  }

  async function reproducir(segmentos, { desde = 0, voz, onSeg, onFin } = {}) {
    cancelado = false
    const usarNeuronal = await ttsNeuronalActivo()
    const vozNav = usarNeuronal ? null : elegirVoz(voz)

    const paso = async (i) => {
      if (cancelado) return
      if (i >= segmentos.length) {
        onFin?.()
        return
      }
      onSeg?.(i)
      const s = segmentos[i]
      const siguiente = () => {
        if (cancelado) return
        timer = setTimeout(() => paso(i + 1), (s.pausa || 2) * 1000)
      }

      if (usarNeuronal) {
        try {
          limpiarUrl()
          urlActual = await sintetizarUrl(s.texto)
          if (cancelado) return
          audioActual = new Audio(urlActual)
          audioActual.onended = siguiente
          audioActual.onerror = siguiente
          await audioActual.play()
          return
        } catch {
          // Cae a voz del navegador para esta frase.
        }
      }
      hablar(s.texto, { voz: vozNav, onend: siguiente })
    }

    paso(desde)
  }

  function detener() {
    cancelado = true
    clearTimeout(timer)
    detenerVoz()
    if (audioActual) {
      audioActual.pause()
      audioActual = null
    }
    limpiarUrl()
  }

  return { reproducir, detener }
}
