import { useEffect, useRef, useState } from 'react'
import { MEDITACIONES } from '../content/meditaciones'
import { tecnica } from '../lib/evidencia'
import { getConfig, setConfig, getHallazgos } from '../lib/db'
import { elegirVoz } from '../lib/util'
import { crearLocutor, ttsNeuronalActivo } from '../lib/tts'
import NaturalezaScene, { escenaPorPaisaje } from '../components/NaturalezaScene'
import { enviarMensaje, hayConexion } from '../lib/anthropic'
import {
  SYSTEM_MEDITACION,
  instruccionMeditacion,
  ENFOQUES,
} from '../content/promptMeditacion'
import EtiquetaEvidencia from '../components/EtiquetaEvidencia'
import Aviso from '../components/Aviso'

export default function Meditaciones() {
  const [sel, setSel] = useState(null)
  const [generando, setGenerando] = useState(false)
  const [conIA, setConIA] = useState(false)

  useEffect(() => {
    hayConexion().then(setConIA)
  }, [])

  if (sel) return <Reproductor med={sel} onVolver={() => setSel(null)} />
  if (generando)
    return <GeneradorMeditacion onListo={setSel} onVolver={() => setGenerando(false)} />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl mb-1">Meditaciones</h1>
        <p className="text-jade/80">
          Voz guiada para acompañar tu práctica. Puedes leerlas, escucharlas con voz sintética o,
          si subes tus propios audios, oírlos con tu voz.
        </p>
      </div>

      {/* Meditación a la medida: solo si hay IA conectada (si no, no mostramos muros de config) */}
      {conIA && (
        <>
          <button
            onClick={() => setGenerando(true)}
            className="w-full rounded-3xl bg-gradient-to-br from-pino to-bosque text-arena p-5 text-left shadow-suave hover:from-bosque hover:to-bosque transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">✺</span>
              <div>
                <h2 className="text-xl font-serif text-arena">Meditación a la medida</h2>
                <p className="text-arena/80 text-sm">
                  Creada para ti según cómo te sientes ahora mismo.
                </p>
              </div>
            </div>
          </button>
          <p className="text-xs text-salvia px-1">o elige una de las grabadas:</p>
        </>
      )}

      <div className="grid gap-3">
        {MEDITACIONES.map((m) => {
          const tec = tecnica(m.tecnica)
          return (
            <button
              key={m.id}
              onClick={() => setSel(m)}
              className="tarjeta overflow-hidden text-left hover:border-jade/40 transition flex"
            >
              <NaturalezaScene
                variante={m.escena || escenaPorPaisaje(m.paisaje)}
                className="w-24 shrink-0 self-stretch"
              />
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="text-xl">{m.titulo}</h2>
                  <span className="text-xs text-salvia whitespace-nowrap">{m.duracionMin} min</span>
                </div>
                <p className="text-sm text-jade/80">{m.subtitulo}</p>
                <div className="flex items-center gap-2 mt-2">
                  {tec && <EtiquetaEvidencia nivel={tec.nivel} className="scale-90" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GeneradorMeditacion({ onListo, onVolver }) {
  const [conectado, setConectado] = useState(null)
  const [enfoque, setEnfoque] = useState(ENFOQUES[0])
  const [estado, setEstado] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    hayConexion().then(setConectado)
  }, [])

  function parse(txt) {
    const limpio = txt.replace(/```json|```/g, '').trim()
    const ini = limpio.indexOf('{')
    const fin = limpio.lastIndexOf('}')
    return JSON.parse(limpio.slice(ini, fin + 1))
  }

  async function generar() {
    setCargando(true)
    setError('')
    try {
      const hallazgos = await getHallazgos()
      const resumen = hallazgos
        .slice(-6)
        .map((h) => `[${h.tipo}] ${h.resumen}`)
        .join('; ')
      const instruccion = instruccionMeditacion({
        enfoque: enfoque.label,
        estado: estado.trim(),
        hallazgos: resumen,
      })
      const texto = await enviarMensaje({
        system: SYSTEM_MEDITACION,
        messages: [{ role: 'user', content: instruccion }],
        maxTokens: 1500,
        temperature: 0.9,
      })
      const r = parse(texto)

      if (r.crisis) {
        setError(
          (r.segmentos?.[0]?.texto || r.titulo || '') +
            ' Si estás en peligro, busca ayuda profesional o llama a emergencias (911) / Línea de la Vida 800 911 2000.',
        )
        return
      }
      if (!Array.isArray(r.segmentos) || !r.segmentos.length) {
        throw new Error('La meditación generada llegó incompleta. Intenta de nuevo.')
      }

      const med = {
        id: 'amedida-' + Date.now(),
        titulo: r.titulo || 'Tu meditación',
        subtitulo: r.subtitulo || 'Creada a tu medida',
        tecnica: enfoque.tecnica,
        duracionMin: r.duracionMin || Math.max(2, Math.round(r.segmentos.length * 0.7)),
        paisaje: r.paisaje || 'un lugar tranquilo en la naturaleza',
        descripcion:
          'Meditación generada a tu medida. Puedes reproducirla con la voz guía o leerla.',
        audioUrl: null,
        segmentos: r.segmentos.map((s) => ({
          texto: String(s.texto || ''),
          pausa: Number(s.pausa) || 4,
        })),
      }
      onListo(med)
    } catch (e) {
      setError(e.message || 'No se pudo generar la meditación.')
    } finally {
      setCargando(false)
    }
  }

  if (conectado === false) {
    return (
      <div className="space-y-5">
        <button onClick={onVolver} className="text-sm text-jade hover:text-pino">
          ‹ Meditaciones
        </button>
        <h1 className="text-3xl">Meditación a la medida</h1>
        <Aviso tono="fuerte">
          Para crear meditaciones a la medida necesitas conectar la IA. Abre Ajustes (⚙︎) y agrega tu
          clave de Anthropic o la URL de tu proxy. Se guarda solo en este dispositivo.
        </Aviso>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <button onClick={onVolver} className="text-sm text-jade hover:text-pino">
        ‹ Meditaciones
      </button>
      <div>
        <h1 className="text-3xl mb-1">Meditación a la medida</h1>
        <p className="text-jade/80">
          Dime qué necesitas hoy y creo una meditación para este momento. No diagnostica ni sustituye
          a un profesional.
        </p>
      </div>

      <div className="tarjeta p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-pino mb-2">¿Qué te vendría bien ahora?</p>
          <div className="flex flex-wrap gap-2">
            {ENFOQUES.map((e) => (
              <button
                key={e.id}
                onClick={() => setEnfoque(e)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  enfoque.id === e.id ? 'bg-pino text-arena' : 'bg-salvia/20 text-jade'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-pino">
            ¿Cómo te sientes? <span className="font-normal text-salvia">(opcional)</span>
          </label>
          <textarea
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            rows={3}
            placeholder="Ej.: llevo todo el día mareado y tenso, con miedo a salir…"
            className="mt-1 w-full resize-none rounded-2xl border border-salvia/30 bg-white/70 px-4 py-3 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
          />
        </div>

        <button onClick={generar} disabled={cargando} className="boton-primario w-full">
          {cargando ? 'Creando tu meditación…' : 'Crear meditación'}
        </button>
        {cargando && (
          <p className="text-xs text-salvia text-center">
            Respira mientras tanto. Esto toma unos segundos.
          </p>
        )}
        {error && <Aviso tono="fuerte">{error}</Aviso>}
      </div>
    </div>
  )
}

function Reproductor({ med, onVolver }) {
  const tec = tecnica(med.tecnica)
  const [seg, setSeg] = useState(-1) // -1 = no iniciado
  const [reproduciendo, setReproduciendo] = useState(false)
  const [voz, setVoz] = useState(null)
  const [vozPref, setVozPref] = useState('')
  const [neural, setNeural] = useState(false)
  const [audioUrl, setAudioUrl] = useState(med.audioUrl)
  const audioRef = useRef(null)
  const locutor = useRef(null)
  const escena = med.escena || escenaPorPaisaje(med.paisaje)

  if (!locutor.current) locutor.current = crearLocutor()

  // Carga voz preferida, estado del TTS neuronal y audio personalizado guardado.
  useEffect(() => {
    function cargar() {
      getConfig('vozPreferida').then((v) => {
        setVozPref(v || '')
        setVoz(elegirVoz(v))
      })
    }
    cargar()
    ttsNeuronalActivo().then(setNeural)
    window.speechSynthesis?.addEventListener?.('voiceschanged', cargar)
    getConfig(`audio:${med.id}`).then((u) => u && setAudioUrl(u))
    const loc = locutor.current
    return () => {
      loc?.detener()
      window.speechSynthesis?.removeEventListener?.('voiceschanged', cargar)
    }
  }, [med.id])

  const segmentos = med.segmentos
  const puedeReproducir = neural || Boolean(voz)

  function play() {
    setReproduciendo(true)
    locutor.current.reproducir(segmentos, {
      desde: seg < 0 ? 0 : seg,
      voz: vozPref,
      onSeg: setSeg,
      onFin: () => {
        setReproduciendo(false)
        setSeg(-1)
      },
    })
  }
  function pause() {
    setReproduciendo(false)
    locutor.current.detener()
  }
  function reiniciar() {
    pause()
    setSeg(-1)
  }

  async function subirAudio(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Guarda el audio como data URL en IndexedDB (config) para que persista local.
    const reader = new FileReader()
    reader.onload = async () => {
      await setConfig(`audio:${med.id}`, reader.result)
      setAudioUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      <button onClick={onVolver} className="text-sm text-jade hover:text-pino">
        ‹ Meditaciones
      </button>

      {/* Cabecera con escena de naturaleza temática */}
      <div className="relative rounded-3xl overflow-hidden shadow-suave">
        <NaturalezaScene variante={escena} className="h-44" />
        <div className="absolute inset-0 bg-gradient-to-t from-bosque/70 via-bosque/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-arena">
          <h1 className="text-3xl text-arena drop-shadow">{med.titulo}</h1>
          <p className="text-arena/90 text-sm mt-0.5">{med.subtitulo}</p>
          <p className="text-arena/70 text-xs italic mt-1">{med.paisaje}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tec && <EtiquetaEvidencia nivel={tec.nivel} />}
        <span className="text-xs text-salvia">{med.duracionMin} min · {tec?.nombre}</span>
      </div>

      <p className="text-jade/85">{med.descripcion}</p>
      {med.nota && <Aviso>{med.nota}</Aviso>}

      {/* Player de audio humano (si hay archivo subido o incluido) */}
      {audioUrl && (
        <div className="tarjeta p-4">
          <p className="text-sm font-semibold text-pino mb-2">Tu audio grabado</p>
          <audio ref={audioRef} controls src={audioUrl} className="w-full" />
        </div>
      )}

      {/* Controles de voz guía */}
      <div className="tarjeta p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-pino">Voz guía</p>
          <span className="text-xs text-salvia">
            {neural
              ? 'Voz neuronal (es-MX)'
              : voz
                ? 'Voz del navegador'
                : 'Sin voz disponible · lee el guion abajo'}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reiniciar} className="boton-fantasma" aria-label="Reiniciar">
            ↺
          </button>
          {reproduciendo ? (
            <button onClick={pause} className="boton-primario w-32">
              Pausar
            </button>
          ) : (
            <button onClick={play} className="boton-primario w-32" disabled={!puedeReproducir}>
              {seg < 0 ? 'Reproducir' : 'Seguir'}
            </button>
          )}
        </div>
      </div>

      {/* Guion en pantalla (siempre disponible, incluso sin voz) */}
      <div className="tarjeta p-5 space-y-3">
        <p className="text-sm font-semibold text-pino">Guion</p>
        {segmentos.map((s, i) => (
          <p
            key={i}
            className={`text-jade/90 transition ${
              seg === i ? 'bg-salvia/25 rounded-xl px-3 py-2 font-medium text-pino' : ''
            }`}
          >
            {s.texto}
          </p>
        ))}
      </div>

      {/* Subir audio propio (voz humana es-MX) */}
      <div className="tarjeta p-5">
        <p className="text-sm font-semibold text-pino mb-1">Sube tu propia voz</p>
        <p className="text-xs text-salvia mb-3">
          Graba este guion con tu voz (formato mp3, m4a o wav) y súbelo aquí. Se guarda solo en este
          dispositivo y reemplaza a la voz sintética para esta meditación.
        </p>
        <input
          type="file"
          accept="audio/*"
          onChange={subirAudio}
          className="block w-full text-sm text-jade file:mr-3 file:rounded-full file:border-0 file:bg-pino file:text-arena file:px-4 file:py-2 file:font-bold"
        />
      </div>
    </div>
  )
}
