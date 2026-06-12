import { useEffect, useRef, useState } from 'react'
import { SYSTEM_EXPLORADOR, PRIMER_TURNO_EXPLORADOR } from '../content/promptExplorador'
import {
  PASOS_GUIADO,
  CIERRE_GUIADO,
  detectarCrisis,
} from '../content/exploradorOffline'
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

function recortar(t = '') {
  const s = t.trim().replace(/\s+/g, ' ')
  return s.length > 90 ? s.slice(0, 90) + '…' : s
}

export default function Explorador({ onCrisis }) {
  const [conectado, setConectado] = useState(null)
  const [hallazgos, setHallazgos] = useState([])

  useEffect(() => {
    hayConexion().then(setConectado)
    getHallazgos().then(setHallazgos)
  }, [])

  function refrescarHallazgos() {
    getHallazgos().then(setHallazgos)
  }

  if (conectado === null) return null

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl mb-1">Explorador del detonante</h1>
        <p className="text-jade/80 text-sm">
          Una pregunta a la vez, para entender qué dispara y sostiene tu mareo y empezar a verlo como
          algo real pero no amenazante. No diagnostica ni sustituye a un profesional.
        </p>
      </div>

      {/* Memoria de hallazgos (compartida) */}
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

      {conectado ? (
        <ChatIA hallazgos={hallazgos} onHallazgo={refrescarHallazgos} onCrisis={onCrisis} />
      ) : (
        <ChatGuiado onHallazgo={refrescarHallazgos} onCrisis={onCrisis} />
      )}
    </div>
  )
}

// ───────────────────────── Burbujas de conversación ─────────────────────────
function Conversacion({ vista, cargando, error, finRef }) {
  return (
    <div className="space-y-3 min-h-[10rem]">
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
  )
}

function EntradaTexto({ entrada, setEntrada, onEnviar, deshabilitado }) {
  return (
    <div className="sticky bottom-20 bg-arena/95 backdrop-blur pt-2">
      <div className="flex items-end gap-2">
        <textarea
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onEnviar()
            }
          }}
          rows={2}
          placeholder="Escribe lo que quieras compartir…"
          className="flex-1 resize-none rounded-2xl border border-salvia/30 bg-white/70 px-4 py-3 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
        />
        <button onClick={onEnviar} disabled={deshabilitado} className="boton-primario">
          Enviar
        </button>
      </div>
    </div>
  )
}

// ───────────────────────── Modo GUIADO (offline, sin IA) ─────────────────────────
function ChatGuiado({ onHallazgo, onCrisis }) {
  const [vista, setVista] = useState([])
  const [paso, setPaso] = useState(-1) // índice del paso cuya pregunta está en pantalla
  const [entrada, setEntrada] = useState('')
  const [terminado, setTerminado] = useState(false)
  const finRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [vista])

  function iniciar() {
    setVista([{ de: 'app', texto: PASOS_GUIADO[0].pregunta }])
    setPaso(0)
    setTerminado(false)
  }

  async function enviar() {
    const txt = entrada.trim()
    if (!txt || terminado) return
    setEntrada('')
    const nuevas = [{ de: 'yo', texto: txt }]

    if (detectarCrisis(txt)) {
      nuevas.push({
        de: 'app',
        texto:
          'Gracias por confiarme esto. Lo que sientes importa y no tienes que pasarlo en soledad. Por favor busca ayuda ahora: alguien de confianza o servicios de emergencia. En México, Línea de la Vida 800 911 2000; emergencias 911.',
      })
      setVista((v) => [...v, ...nuevas])
      setTerminado(true)
      onCrisis?.()
      return
    }

    const actual = PASOS_GUIADO[paso]
    if (actual?.tipo) {
      await addHallazgo({ tipo: actual.tipo, resumen: recortar(txt), ts: new Date().toISOString() })
      onHallazgo?.()
    }

    const siguiente = paso + 1
    const esUltimo = siguiente >= PASOS_GUIADO.length
    nuevas.push({
      de: 'app',
      reflejo: actual?.reflejo ? actual.reflejo(txt) : '',
      reencuadre: actual?.reencuadre || '',
      texto: esUltimo ? CIERRE_GUIADO : PASOS_GUIADO[siguiente].pregunta,
    })
    setVista((v) => [...v, ...nuevas])
    if (esUltimo) setTerminado(true)
    else setPaso(siguiente)
  }

  return (
    <div className="space-y-4">
      <Aviso>
        Estás en el modo guiado, que funciona sin conexión. Si conectas la IA en Ajustes, la
        conversación se vuelve más libre y se adapta a ti.
      </Aviso>

      {vista.length === 0 ? (
        <div className="text-center py-8">
          <button onClick={iniciar} className="boton-primario">
            Empezar la conversación
          </button>
        </div>
      ) : (
        <Conversacion vista={vista} finRef={finRef} />
      )}

      {vista.length > 0 && !terminado && (
        <EntradaTexto entrada={entrada} setEntrada={setEntrada} onEnviar={enviar} />
      )}

      {terminado && (
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

// ───────────────────────── Modo IA (cuando hay conexión) ─────────────────────────
function ChatIA({ hallazgos, onHallazgo, onCrisis }) {
  const [mensajes, setMensajes] = useState([])
  const [vista, setVista] = useState([])
  const [entrada, setEntrada] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cerrado, setCerrado] = useState(false)
  const [error, setError] = useState('')
  const finRef = useRef(null)

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
      return { reflejo: '', mensaje: txt, hallazgos: [], reencuadre: '', crisis: false, cierre: false }
    }
  }

  async function turno(historial) {
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
      if (Array.isArray(r.hallazgos) && r.hallazgos.length) {
        for (const h of r.hallazgos) {
          if (h?.resumen) await addHallazgo({ ...h, ts: new Date().toISOString() })
        }
        onHallazgo?.()
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
    setVista([])
    setCerrado(false)
    await turno([{ role: 'user', content: PRIMER_TURNO_EXPLORADOR + memoria }])
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

  return (
    <div className="space-y-4">
      {vista.length === 0 && !cargando ? (
        <div className="text-center py-8">
          <button onClick={iniciar} className="boton-primario">
            Empezar la conversación
          </button>
        </div>
      ) : (
        <Conversacion vista={vista} cargando={cargando} error={error} finRef={finRef} />
      )}

      {vista.length > 0 && !cerrado && (
        <EntradaTexto
          entrada={entrada}
          setEntrada={setEntrada}
          onEnviar={enviar}
          deshabilitado={cargando}
        />
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
