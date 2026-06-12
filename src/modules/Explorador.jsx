import { useEffect, useRef, useState } from 'react'
import { SYSTEM_EXPLORADOR, PRIMER_TURNO_EXPLORADOR } from '../content/promptExplorador'
import { enviarMensaje, hayConexion } from '../lib/anthropic'
import { addHallazgo, getHallazgos } from '../lib/db'
import Aviso from '../components/Aviso'

const TIPOS = {
  precipitante: { label: 'Detonante', color: 'bg-jade/15 text-pino' },
  amenaza: { label: 'Creencia de amenaza', color: 'bg-pino/10 text-pino' },
  evitacion: { label: 'Evitación', color: 'bg-salvia/25 text-bosque' },
  hipervigilancia: { label: 'Hipervigilancia', color: 'bg-salvia/25 text-bosque' },
  fortaleza: { label: 'Recurso', color: 'bg-jade/20 text-pino' },
}

export default function Explorador({ onCrisis }) {
  const [conectado, setConectado] = useState(null)
  const [mensajes, setMensajes] = useState([]) // {role, content} para la API
  const [vista, setVista] = useState([]) // para mostrar: {de:'app'|'yo', reflejo, texto, reencuadre}
  const [entrada, setEntrada] = useState('')
  const [cargando, setCargando] = useState(false)
  const [hallazgos, setHallazgos] = useState([])
  const [cerrado, setCerrado] = useState(false)
  const [error, setError] = useState('')
  const finRef = useRef(null)

  useEffect(() => {
    hayConexion().then(setConectado)
    getHallazgos().then(setHallazgos)
  }, [])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [vista, cargando])

  function parseRespuesta(txt) {
    try {
      const limpio = txt.replace(/```json|```/g, '').trim()
      const ini = limpio.indexOf('{')
      const fin = limpio.lastIndexOf('}')
      return JSON.parse(limpio.slice(ini, fin + 1))
    } catch {
      // Si el modelo no devolvió JSON, usamos el texto crudo como mensaje.
      return { reflejo: '', mensaje: txt, hallazgos: [], reencuadre: '', crisis: false, cierre: false }
    }
  }

  async function turno(historial, etiquetaUsuario) {
    setCargando(true)
    setError('')
    try {
      const texto = await enviarMensaje({
        system: SYSTEM_EXPLORADOR,
        messages: historial,
        maxTokens: 700,
        temperature: 0.8,
      })
      const r = parseRespuesta(texto)

      setMensajes([...historial, { role: 'assistant', content: texto }])
      setVista((v) => [
        ...v,
        { de: 'app', reflejo: r.reflejo, texto: r.mensaje, reencuadre: r.reencuadre },
      ])

      // Guarda hallazgos nuevos en memoria local.
      if (Array.isArray(r.hallazgos) && r.hallazgos.length) {
        for (const h of r.hallazgos) {
          if (h?.resumen) await addHallazgo({ ...h, ts: new Date().toISOString() })
        }
        getHallazgos().then(setHallazgos)
      }

      if (r.crisis) {
        setCerrado(true)
        onCrisis?.()
      }
      if (r.cierre) setCerrado(true)
    } catch (e) {
      setError(e.message || 'No se pudo conectar con la IA.')
    } finally {
      setCargando(false)
    }
  }

  async function iniciar() {
    const memoria = hallazgos.length
      ? `\n\nContexto de sesiones previas (memoria local, úsalo con tacto, no lo recites): ${hallazgos
          .map((h) => `[${h.tipo}] ${h.resumen}`)
          .join('; ')}`
      : ''
    const historial = [{ role: 'user', content: PRIMER_TURNO_EXPLORADOR + memoria }]
    setVista([])
    setCerrado(false)
    await turno(historial)
  }

  async function enviar() {
    const txt = entrada.trim()
    if (!txt || cargando) return
    setEntrada('')
    setVista((v) => [...v, { de: 'yo', texto: txt }])
    const historial = [...mensajes, { role: 'user', content: txt }]
    setMensajes(historial)
    await turno(historial)
  }

  // --- Sin conexión configurada ---
  if (conectado === false) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl">Explorador del detonante</h1>
        <p className="text-jade/80">
          Un diálogo guiado, una pregunta a la vez, para entender qué dispara y sostiene tu mareo, y
          empezar a verlo como algo real pero no amenazante. Informado por terapia
          cognitivo-conductual.
        </p>
        <Aviso tono="fuerte">
          Para usar este módulo necesitas conectar la IA. Abre Ajustes (⚙︎) y agrega tu clave de
          Anthropic o la URL de tu proxy. La clave se guarda solo en este dispositivo.
        </Aviso>
        <p className="text-xs text-salvia">
          Este acompañante no diagnostica, no prescribe ni sustituye atención profesional.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl mb-1">Explorador del detonante</h1>
        <p className="text-jade/80 text-sm">
          Una pregunta a la vez. Puedes parar cuando quieras. No diagnostica ni sustituye a un
          profesional.
        </p>
      </div>

      {/* Memoria de hallazgos */}
      {hallazgos.length > 0 && (
        <details className="tarjeta p-4">
          <summary className="text-sm font-semibold text-pino cursor-pointer">
            Lo que hemos notado ({hallazgos.length})
          </summary>
          <div className="flex flex-wrap gap-2 mt-3">
            {hallazgos.map((h, i) => (
              <span
                key={i}
                className={`text-xs rounded-full px-2.5 py-1 ${TIPOS[h.tipo]?.color || 'bg-salvia/20 text-jade'}`}
                title={TIPOS[h.tipo]?.label}
              >
                {h.resumen}
              </span>
            ))}
          </div>
        </details>
      )}

      {/* Conversación */}
      <div className="space-y-3 min-h-[12rem]">
        {vista.length === 0 && !cargando && (
          <div className="text-center py-8">
            <button onClick={iniciar} className="boton-primario">
              Empezar la conversación
            </button>
          </div>
        )}
        {vista.map((m, i) => (
          <div key={i} className={m.de === 'yo' ? 'flex justify-end' : ''}>
            <div
              className={
                m.de === 'yo'
                  ? 'bg-pino text-arena rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]'
                  : 'tarjeta px-4 py-3 max-w-[90%]'
              }
            >
              {m.reflejo ? <p className="text-sm text-salvia italic mb-1">{m.reflejo}</p> : null}
              <p className={m.de === 'yo' ? '' : 'text-jade'}>{m.texto}</p>
              {m.reencuadre ? (
                <p className="text-sm mt-2 rounded-xl bg-salvia/20 text-pino px-3 py-2">
                  💡 {m.reencuadre}
                </p>
              ) : null}
            </div>
          </div>
        ))}
        {cargando && <p className="text-sm text-salvia animate-pulse">Pensando contigo…</p>}
        {error && <Aviso tono="fuerte">{error}</Aviso>}
        <div ref={finRef} />
      </div>

      {/* Entrada */}
      {vista.length > 0 && !cerrado && (
        <div className="sticky bottom-20 bg-arena/95 backdrop-blur pt-2">
          <div className="flex items-end gap-2">
            <textarea
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
              rows={2}
              placeholder="Escribe lo que quieras compartir…"
              className="flex-1 resize-none rounded-2xl border border-salvia/30 bg-white/70 px-4 py-3 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
            />
            <button onClick={enviar} disabled={cargando} className="boton-primario">
              Enviar
            </button>
          </div>
        </div>
      )}

      {cerrado && (
        <div className="text-center py-4">
          <p className="text-sm text-salvia mb-3">Sesión cerrada. Tus notas quedaron guardadas.</p>
          <button onClick={iniciar} className="boton-suave">
            Nueva conversación
          </button>
        </div>
      )}
    </div>
  )
}
