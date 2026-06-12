import { useEffect, useMemo, useState } from 'react'
import { PASOS_RUTA, decidirNivel, mensajeNivel } from '../content/ruta'
import { addRuta, getRutas, addEntradaDiario } from '../lib/db'
import { tecnica } from '../lib/evidencia'
import { hoyISO } from '../lib/util'
import EtiquetaEvidencia from '../components/EtiquetaEvidencia'
import PatronVisual from '../components/PatronVisual'
import NaturalezaScene from '../components/NaturalezaScene'

const ESTADOS = [
  { id: 'malo', emoji: '🌧️', texto: 'Día difícil' },
  { id: 'normal', emoji: '⛅', texto: 'Más o menos' },
  { id: 'bueno', emoji: '🌤️', texto: 'Me siento con margen' },
]

export default function RutaDiaria({ perfil }) {
  const [rutas, setRutas] = useState([])
  const [fase, setFase] = useState('intro') // intro | check | sesion | fin
  const [estado, setEstado] = useState(null)
  const [nivel, setNivel] = useState(1)
  const [paso, setPaso] = useState(0)

  useEffect(() => {
    getRutas().then(setRutas)
  }, [])

  const nivelPrevio = useMemo(() => {
    if (!rutas.length) return null
    return rutas[rutas.length - 1]?.nivel ?? null
  }, [rutas])

  const hechoHoy = rutas.some((r) => r.fecha === hoyISO())

  function comenzar() {
    setFase('check')
  }

  function elegirEstado(e) {
    const n = decidirNivel(e, nivelPrevio)
    setEstado(e)
    setNivel(n)
    setPaso(0)
    setFase('sesion')
  }

  async function terminar() {
    const registro = {
      fecha: hoyISO(),
      ts: new Date().toISOString(),
      estado,
      nivel,
      completado: true,
    }
    await addRuta(registro)
    // Deja también una marca ligera en el diario para el seguimiento.
    await addEntradaDiario({
      fecha: hoyISO(),
      ts: new Date().toISOString(),
      tipo: 'ruta',
      estado,
      nivel,
    })
    const nuevas = await getRutas()
    setRutas(nuevas)
    setFase('fin')
  }

  // --- INTRO ---
  if (fase === 'intro') {
    return (
      <div className="space-y-5">
        <div className="relative rounded-3xl overflow-hidden shadow-suave">
          <NaturalezaScene variante="campo" estatico className="h-32" />
          <div className="absolute inset-0 bg-gradient-to-t from-bosque/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h1 className="text-3xl text-arena drop-shadow">Tu ruta de hoy</h1>
            <p className="text-arena/85 text-sm mt-0.5">
              Menos de 10 minutos. Se adapta a cómo llegas hoy.
            </p>
          </div>
        </div>
        <p className="text-jade/80">
          Combina reentrenamiento suave, respiración, aceptación y un pequeño reto. Sin culpa si un
          día no se puede.
        </p>

        {hechoHoy && (
          <div className="tarjeta p-4 text-sm text-jade">
            Ya hiciste tu ruta hoy. 🤍 Puedes repetirla si quieres, pero también descansar cuenta.
          </div>
        )}

        <div className="tarjeta p-5">
          <p className="text-sm font-bold text-pino mb-3">La ruta incluye:</p>
          <ul className="space-y-2">
            {PASOS_RUTA.filter((p) => p.id !== 'check-in').map((p) => {
              const tec = p.tecnica ? tecnica(p.tecnica) : null
              return (
                <li key={p.id} className="flex items-start gap-3 text-sm">
                  <span className="text-lg">{p.icono}</span>
                  <span>
                    <span className="font-semibold text-jade">{p.nombre}</span>
                    {tec && <EtiquetaEvidencia nivel={tec.nivel} className="ml-2 scale-90" />}
                    <span className="block text-salvia">{p.descripcion}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <button onClick={comenzar} className="boton-primario w-full">
          {hechoHoy ? 'Repetir ruta' : 'Empezar mi ruta'}
        </button>
      </div>
    )
  }

  // --- CHECK-IN ---
  if (fase === 'check') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-1">¿Cómo llegas hoy?</h1>
          <p className="text-jade/80">
            No hay respuesta correcta. Esto solo ajusta la intensidad de tu ruta.
          </p>
        </div>
        <div className="grid gap-3">
          {ESTADOS.map((e) => (
            <button
              key={e.id}
              onClick={() => elegirEstado(e.id)}
              className="tarjeta p-5 flex items-center gap-4 text-left hover:border-jade/40 transition"
            >
              <span className="text-3xl">{e.emoji}</span>
              <span className="font-semibold text-jade text-lg">{e.texto}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // --- FIN ---
  if (fase === 'fin') {
    return (
      <div className="space-y-6 text-center pt-6">
        <div className="text-5xl">🤍</div>
        <h1 className="text-3xl">Lo hiciste</h1>
        <p className="text-jade/80 max-w-sm mx-auto">
          No importa cómo se haya sentido. Volviste a tu ruta, y eso es exactamente lo que reentrena
          el patrón. Sin exigirte de más mañana.
        </p>
        <button onClick={() => setFase('intro')} className="boton-suave">
          Volver al inicio
        </button>
      </div>
    )
  }

  // --- SESIÓN (paso a paso) ---
  return (
    <SesionRuta
      nivel={nivel}
      estado={estado}
      paso={paso}
      setPaso={setPaso}
      onTerminar={terminar}
    />
  )
}

function SesionRuta({ nivel, estado, paso, setPaso, onTerminar }) {
  const pasos = PASOS_RUTA
  const actual = pasos[paso]
  const cfg = actual.niveles[nivel]
  const tec = actual.tecnica ? tecnica(actual.tecnica) : null
  const esUltimo = paso === pasos.length - 1
  const [restante, setRestante] = useState(cfg.duracionSeg || 0)
  const [corriendo, setCorriendo] = useState(false)
  // Reto del día derivado del paso actual y el nivel (determinista, sin repetir el mismo siempre).
  const retoElegido = cfg.retos ? cfg.retos[(paso + nivel) % cfg.retos.length] : null

  useEffect(() => {
    setRestante(cfg.duracionSeg || 0)
    setCorriendo(false)
  }, [paso, cfg.duracionSeg])

  useEffect(() => {
    if (!corriendo || restante <= 0) return
    const t = setTimeout(() => setRestante((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [corriendo, restante])

  const tieneTemporizador = (cfg.duracionSeg || 0) > 0

  return (
    <div className="space-y-5">
      {/* Progreso de pasos + nota adaptativa */}
      <div>
        <div className="flex gap-1 mb-2">
          {pasos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full ${idx <= paso ? 'bg-pino' : 'bg-salvia/30'}`}
            />
          ))}
        </div>
        {paso === 0 && (
          <p className="text-xs text-jade bg-salvia/15 rounded-xl px-3 py-2">
            {mensajeNivel(nivel, estado)}
          </p>
        )}
      </div>

      <div className="tarjeta p-6 min-h-[18rem] flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{actual.icono}</span>
          <div>
            <h2 className="text-2xl leading-none">{actual.nombre}</h2>
            {tec && <EtiquetaEvidencia nivel={tec.nivel} className="mt-1 scale-90" />}
          </div>
        </div>

        <p className="text-lg text-jade/90 my-4 flex-1">{cfg.guia}</p>

        {/* Reto conductual: lista de opciones */}
        {actual.usaPatronVisual && (
          <div className="mb-4">
            <PatronVisual velocidad={cfg.velocidad} intensidad={cfg.intensidad} activo={corriendo} />
            <p className="text-xs text-salvia mt-2 text-center">
              Si el malestar sube mucho, cierra los ojos y respira. Bajar la intensidad es parte del
              entreno, no un retroceso.
            </p>
          </div>
        )}

        {retoElegido && (
          <div className="rounded-2xl bg-salvia/15 p-4 mb-4">
            <p className="text-sm font-semibold text-pino mb-1">Reto sugerido:</p>
            <p className="text-jade">{retoElegido}</p>
            <p className="text-xs text-salvia mt-2">
              Si hoy no se puede, no pasa nada. Solo intentarlo ya cuenta.
            </p>
          </div>
        )}

        {/* Temporizador opcional */}
        {tieneTemporizador && (
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="font-serif text-4xl text-pino tabular-nums">
              {Math.floor(restante / 60)}:{String(restante % 60).padStart(2, '0')}
            </span>
            <button onClick={() => setCorriendo((c) => !c)} className="boton-suave">
              {corriendo ? 'Pausar' : restante === cfg.duracionSeg ? 'Iniciar' : 'Seguir'}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setPaso((p) => Math.max(0, p - 1))}
          className={`boton-fantasma ${paso === 0 ? 'invisible' : ''}`}
        >
          Atrás
        </button>
        {esUltimo ? (
          <button onClick={onTerminar} className="boton-primario">
            Terminar ruta
          </button>
        ) : (
          <button onClick={() => setPaso((p) => p + 1)} className="boton-primario">
            Siguiente
          </button>
        )}
      </div>
    </div>
  )
}
