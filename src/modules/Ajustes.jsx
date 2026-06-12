import { useEffect, useState } from 'react'
import {
  getApiKey,
  setApiKey,
  getModelo,
  setModelo,
  getProxyUrl,
  setProxyUrl,
  DEFAULT_MODEL,
} from '../lib/anthropic'
import { getConfig, setConfig, exportarTodo, borrarTodo } from '../lib/db'
import { getTtsConfig, setTtsConfig } from '../lib/tts'
import { vocesDisponibles } from '../lib/util'
import Aviso from '../components/Aviso'

export default function Ajustes({ onCerrar, onPerfil }) {
  const [key, setKey] = useState('')
  const [modelo, setMod] = useState(DEFAULT_MODEL)
  const [proxy, setProxy] = useState('')
  const [voz, setVoz] = useState('')
  const [voces, setVoces] = useState([])
  const [tts, setTts] = useState({ endpoint: '', apiKey: '', voz: '' })
  const [recOn, setRecOn] = useState(false)
  const [recHora, setRecHora] = useState('09:00')
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    getApiKey().then(setKey)
    getModelo().then(setMod)
    getProxyUrl().then(setProxy)
    getTtsConfig().then(setTts)
    getConfig('recordatorioOn', false).then(setRecOn)
    getConfig('recordatorioHora', '09:00').then((h) => setRecHora(h || '09:00'))
    getConfig('vozPreferida').then((v) => setVoz(v || ''))
    const cargarVoces = () => setVoces(vocesDisponibles())
    cargarVoces()
    window.speechSynthesis?.addEventListener?.('voiceschanged', cargarVoces)
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', cargarVoces)
  }, [])

  async function guardar() {
    await setApiKey(key.trim())
    await setModelo(modelo.trim() || DEFAULT_MODEL)
    await setProxyUrl(proxy.trim())
    await setTtsConfig({
      endpoint: tts.endpoint.trim(),
      apiKey: tts.apiKey.trim(),
      voz: tts.voz.trim(),
    })
    await setConfig('vozPreferida', voz)
    await setConfig('recordatorioOn', recOn)
    await setConfig('recordatorioHora', recHora)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 1800)
  }

  async function alternarRecordatorio(v) {
    if (v && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const permiso = await Notification.requestPermission()
      if (permiso !== 'granted') {
        setRecOn(false)
        return
      }
    }
    setRecOn(v)
  }

  async function exportar() {
    const data = await exportarTodo()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ruta-calma-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function borrar() {
    if (!confirm('¿Borrar TODOS tus datos locales (diario, reportes, memoria)? No se puede deshacer.'))
      return
    await borrarTodo()
    onPerfil?.(null)
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-50 bg-bosque/40 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen max-w-lg mx-auto p-4">
        <div className="tarjeta bg-arena p-6 space-y-6 animate-aparece">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-pino">Ajustes</h2>
            <button onClick={onCerrar} className="text-jade hover:text-pino text-xl">
              ✕
            </button>
          </div>

          {/* Avanzado: conexión IA y voz neuronal. Oculto por defecto para mantener la simplicidad. */}
          <details className="rounded-2xl bg-salvia/10 p-3">
          <summary className="text-sm font-semibold text-pino cursor-pointer">
            Avanzado (conexión con IA y voz neuronal)
          </summary>
          <p className="text-xs text-salvia mt-2">
            La app funciona sin esto: el Explorador tiene un modo guiado y las meditaciones usan la
            voz del navegador. Configura aquí solo si quieres respuestas de IA y voz neuronal.
          </p>
          <div className="space-y-6 mt-4">

          {/* Conexión IA */}
          <section className="space-y-3">
            <h3 className="font-semibold text-pino">Conexión con la IA (Explorador)</h3>
            <Aviso>
              Tu clave se guarda <strong>solo en este dispositivo</strong> (IndexedDB) y nunca se
              comparte. Para distribución pública, usa mejor un proxy propio (ver README).
            </Aviso>
            <label className="block text-sm">
              <span className="text-jade font-medium">Clave de API de Anthropic</span>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-ant-..."
                className="mt-1 w-full rounded-xl border border-salvia/30 bg-white/70 px-3 py-2 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
              />
            </label>
            <label className="block text-sm">
              <span className="text-jade font-medium">Modelo</span>
              <input
                value={modelo}
                onChange={(e) => setMod(e.target.value)}
                placeholder={DEFAULT_MODEL}
                className="mt-1 w-full rounded-xl border border-salvia/30 bg-white/70 px-3 py-2 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
              />
            </label>
            <label className="block text-sm">
              <span className="text-jade font-medium">URL de proxy (opcional, recomendado)</span>
              <input
                value={proxy}
                onChange={(e) => setProxy(e.target.value)}
                placeholder="https://mi-proxy.ejemplo.com/api/chat"
                className="mt-1 w-full rounded-xl border border-salvia/30 bg-white/70 px-3 py-2 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
              />
            </label>
          </section>

          {/* Voz TTS neuronal (configurable) */}
          <section className="space-y-3">
            <h3 className="font-semibold text-pino">Voz neuronal de las meditaciones</h3>
            <p className="text-xs text-salvia">
              Opcional. Conecta un endpoint de TTS neuronal en es-MX (vía tu proxy a ElevenLabs,
              Google, Azure, etc.). Si lo configuras, reemplaza a la voz del navegador. Contrato del
              endpoint en el README.
            </p>
            <label className="block text-sm">
              <span className="text-jade font-medium">URL del endpoint de TTS</span>
              <input
                value={tts.endpoint}
                onChange={(e) => setTts((s) => ({ ...s, endpoint: e.target.value }))}
                placeholder="https://mi-proxy.ejemplo.com/api/tts"
                className="mt-1 w-full rounded-xl border border-salvia/30 bg-white/70 px-3 py-2 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">
                <span className="text-jade font-medium">Voz (id, opcional)</span>
                <input
                  value={tts.voz}
                  onChange={(e) => setTts((s) => ({ ...s, voz: e.target.value }))}
                  placeholder="es-MX-Dalia / voiceId"
                  className="mt-1 w-full rounded-xl border border-salvia/30 bg-white/70 px-3 py-2 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
                />
              </label>
              <label className="block text-sm">
                <span className="text-jade font-medium">Token (opcional)</span>
                <input
                  type="password"
                  value={tts.apiKey}
                  onChange={(e) => setTts((s) => ({ ...s, apiKey: e.target.value }))}
                  placeholder="Bearer…"
                  className="mt-1 w-full rounded-xl border border-salvia/30 bg-white/70 px-3 py-2 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
                />
              </label>
            </div>
          </section>
          </div>
          </details>

          {/* Voz del navegador (respaldo) */}
          <section className="space-y-2">
            <h3 className="font-semibold text-pino">Voz de las meditaciones</h3>
            <p className="text-xs text-salvia">
              Se usa si no configuras voz neuronal. Lo ideal es subir tus propios audios en cada
              meditación.
            </p>
            <select
              value={voz}
              onChange={(e) => setVoz(e.target.value)}
              className="w-full rounded-xl border border-salvia/30 bg-white/70 px-3 py-2 text-jade"
            >
              <option value="">Automática (es-MX si existe)</option>
              {voces.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </section>

          {/* Recordatorio diario */}
          <section className="space-y-2">
            <h3 className="font-semibold text-pino">Recordatorio diario</h3>
            <p className="text-xs text-salvia">
              Un aviso amable para tu ruta, mientras la app esté abierta. Sin culpa si lo ignoras.
            </p>
            <label className="flex items-center gap-3 text-sm text-jade">
              <input
                type="checkbox"
                checked={recOn}
                onChange={(e) => alternarRecordatorio(e.target.checked)}
                className="w-5 h-5 accent-pino"
              />
              Activar recordatorio
            </label>
            {recOn && (
              <label className="block text-sm">
                <span className="text-jade font-medium">Hora</span>
                <input
                  type="time"
                  value={recHora}
                  onChange={(e) => setRecHora(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-salvia/30 bg-white/70 px-3 py-2 text-jade"
                />
              </label>
            )}
          </section>

          <button onClick={guardar} className="boton-primario w-full">
            {guardado ? 'Guardado 🤍' : 'Guardar ajustes'}
          </button>

          {/* Privacidad / datos */}
          <section className="space-y-2 pt-2 border-t border-salvia/20">
            <h3 className="font-semibold text-pino">Tus datos</h3>
            <p className="text-xs text-salvia">
              Todo vive en este dispositivo. Puedes llevártelo o borrarlo cuando quieras.
            </p>
            <div className="flex gap-2">
              <button onClick={exportar} className="boton-suave flex-1">
                Exportar datos
              </button>
              <button
                onClick={borrar}
                className="boton flex-1 bg-pino/10 text-pino hover:bg-pino/20"
              >
                Borrar todo
              </button>
            </div>
          </section>

          <p className="text-[11px] text-salvia text-center pt-2">
            Ruta Calma es apoyo y autocuidado, no tratamiento médico. «Lo que eres no necesita
            arreglarse.»
          </p>
        </div>
      </div>
    </div>
  )
}
