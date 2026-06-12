import { useEffect, useRef, useState } from 'react'
import { getConfig, setConfig, addEntradaDiario } from '../lib/db'
import { tecnica } from '../lib/evidencia'
import { hoyISO } from '../lib/util'
import EtiquetaEvidencia from '../components/EtiquetaEvidencia'
import PatronVisual from '../components/PatronVisual'
import Aviso from '../components/Aviso'

// Niveles graduados (1–4). Cada uno propone patrón, velocidad, intensidad y duración.
// Filosofía VRT: trabajar en un umbral tolerable que sube despacio; pausar al instante.
const NIVELES = {
  1: { patron: 'puntos', direccion: 'horizontal', velocidad: 0.3, intensidad: 0.25, seg: 30, nombre: 'Muy suave' },
  2: { patron: 'barras', direccion: 'horizontal', velocidad: 0.5, intensidad: 0.45, seg: 45, nombre: 'Suave' },
  3: { patron: 'tablero', direccion: 'horizontal', velocidad: 0.7, intensidad: 0.6, seg: 60, nombre: 'Medio' },
  4: { patron: 'ondas', direccion: 'horizontal', velocidad: 1, intensidad: 0.8, seg: 75, nombre: 'Mayor' },
}
const PATRONES = [
  ['puntos', 'Puntos'],
  ['barras', 'Barras'],
  ['tablero', 'Tablero'],
  ['ondas', 'Ondas'],
]

export default function ExposicionVisual({ onVolver }) {
  const tec = tecnica('vrt')
  const [fase, setFase] = useState('intro') // intro | practica | despues | fin
  const [nivel, setNivel] = useState(1)
  const [cfg, setCfg] = useState(NIVELES[1])
  const [antes, setAntes] = useState(4)
  const [despues, setDespues] = useState(4)
  const [restante, setRestante] = useState(0)
  const [corriendo, setCorriendo] = useState(false)
  const [sugerencia, setSugerencia] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    getConfig('exposicionNivel', 1).then((n) => {
      const nv = Number(n) || 1
      setNivel(nv)
      setCfg({ ...NIVELES[nv] })
    })
  }, [])

  // Temporizador
  useEffect(() => {
    if (fase !== 'practica' || !corriendo || restante <= 0) return
    timer.current = setTimeout(() => setRestante((r) => r - 1), 1000)
    return () => clearTimeout(timer.current)
  }, [fase, corriendo, restante])

  // Al llegar a 0, pasa a la valoración posterior.
  useEffect(() => {
    if (fase === 'practica' && corriendo && restante === 0) {
      setCorriendo(false)
      setFase('despues')
    }
  }, [restante, corriendo, fase])

  function empezar() {
    setRestante(cfg.seg)
    setCorriendo(true)
    setFase('practica')
  }

  async function terminar() {
    const delta = despues - antes
    let nuevoNivel = nivel
    let msg
    if (delta <= 2) {
      nuevoNivel = Math.min(4, nivel + 1)
      msg =
        delta <= 0
          ? 'Lo toleraste muy bien. La próxima vez podemos subir un poquito la exposición.'
          : 'Lo toleraste bien. Cuando quieras, subimos un poco. Sin prisa.'
    } else if (delta >= 4) {
      nuevoNivel = Math.max(1, nivel - 1)
      msg =
        'Subió bastante el malestar. La próxima bajamos la intensidad: eso NO es retroceder, es exactamente cómo se entrena.'
    } else {
      msg = 'Buen trabajo. Mantenemos este nivel hasta que se sienta más cómodo.'
    }
    await setConfig('exposicionNivel', nuevoNivel)
    await addEntradaDiario({
      fecha: hoyISO(),
      ts: new Date().toISOString(),
      tipo: 'exposicion',
      nivel,
      patron: cfg.patron,
      antes,
      despues,
    })
    setSugerencia(msg)
    setFase('fin')
  }

  function cambiarNivel(nv) {
    setNivel(nv)
    setCfg({ ...NIVELES[nv] })
  }

  // ── INTRO ──
  if (fase === 'intro') {
    return (
      <Marco onVolver={onVolver} tec={tec}>
        <h2 className="text-2xl">Práctica de exposición visual</h2>
        <p className="text-jade/85">
          Reentrenas a tu cerebro a tolerar el movimiento visual quedándote con él un poco, en vez de
          huir. Tú marcas el ritmo y puedes pausar al instante.
        </p>
        <Aviso>
          Si el malestar sube mucho, cierra los ojos y respira. Bajar la intensidad es parte del
          entreno, no un retroceso. Si tienes un diagnóstico que lo desaconseje, consulta a tu
          especialista.
        </Aviso>

        <div>
          <p className="text-sm font-semibold text-pino mb-2">Nivel sugerido para ti</p>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((nv) => (
              <button
                key={nv}
                onClick={() => cambiarNivel(nv)}
                className={`rounded-xl py-2 text-sm font-semibold ${
                  nivel === nv ? 'bg-pino text-arena' : 'bg-salvia/20 text-jade'
                }`}
              >
                {nv}
                <span className="block text-[10px] font-normal">{NIVELES[nv].nombre}</span>
              </button>
            ))}
          </div>
        </div>

        <Slider
          label="Antes de empezar, ¿cuánto mareo o malestar tienes ahora?"
          valor={antes}
          onChange={setAntes}
        />

        <button onClick={empezar} className="boton-primario w-full">
          Empezar exposición ({cfg.seg}s)
        </button>
      </Marco>
    )
  }

  // ── PRÁCTICA ──
  if (fase === 'practica') {
    return (
      <Marco onVolver={onVolver} tec={tec}>
        <h2 className="text-2xl">Quédate con el movimiento</h2>
        <PatronVisual
          tipo={cfg.patron}
          direccion={cfg.direccion}
          velocidad={cfg.velocidad}
          intensidad={cfg.intensidad}
          activo={corriendo}
        />

        <div className="flex items-center justify-center gap-4">
          <span className="font-serif text-4xl text-pino tabular-nums">
            {Math.floor(restante / 60)}:{String(restante % 60).padStart(2, '0')}
          </span>
          <button onClick={() => setCorriendo((c) => !c)} className="boton-suave">
            {corriendo ? 'Pausar' : 'Seguir'}
          </button>
        </div>

        {/* Controles finos opcionales */}
        <details className="tarjeta p-4">
          <summary className="text-sm font-semibold text-pino cursor-pointer">Ajustar estímulo</summary>
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {PATRONES.map(([id, n]) => (
                <button
                  key={id}
                  onClick={() => setCfg((c) => ({ ...c, patron: id }))}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    cfg.patron === id ? 'bg-jade text-arena' : 'bg-salvia/20 text-jade'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <RangoFino
              label="Velocidad"
              valor={cfg.velocidad}
              onChange={(v) => setCfg((c) => ({ ...c, velocidad: v }))}
            />
            <RangoFino
              label="Intensidad"
              valor={cfg.intensidad}
              onChange={(v) => setCfg((c) => ({ ...c, intensidad: v }))}
            />
          </div>
        </details>

        <button onClick={() => { setCorriendo(false); setFase('despues') }} className="boton-fantasma w-full">
          Terminar ahora
        </button>
      </Marco>
    )
  }

  // ── DESPUÉS ──
  if (fase === 'despues') {
    return (
      <Marco onVolver={onVolver} tec={tec}>
        <h2 className="text-2xl">¿Cómo quedaste?</h2>
        <p className="text-jade/85">
          Nota cómo te sientes ahora. Es normal algo de mareo tras la exposición; suele bajar en unos
          minutos.
        </p>
        <Slider
          label="¿Cuánto mareo o malestar tienes en este momento?"
          valor={despues}
          onChange={setDespues}
        />
        <button onClick={terminar} className="boton-primario w-full">
          Guardar y ver sugerencia
        </button>
      </Marco>
    )
  }

  // ── FIN ──
  return (
    <Marco onVolver={onVolver} tec={tec}>
      <div className="text-center space-y-4 py-2">
        <div className="text-4xl">🌾</div>
        <h2 className="text-2xl">Lo hiciste</h2>
        <p className="text-jade/85">{sugerencia}</p>
        <div className="flex gap-2">
          <button onClick={() => { setFase('intro') }} className="boton-suave flex-1">
            Otra ronda
          </button>
          <button onClick={onVolver} className="boton-primario flex-1">
            Volver
          </button>
        </div>
      </div>
    </Marco>
  )
}

function Marco({ children, onVolver, tec }) {
  return (
    <div className="space-y-4">
      <button onClick={onVolver} className="text-sm text-jade hover:text-pino">
        ‹ Volver
      </button>
      {tec && (
        <div className="flex items-center gap-2">
          <EtiquetaEvidencia nivel={tec.nivel} />
          <span className="text-xs text-salvia">{tec.nombre}</span>
        </div>
      )}
      {children}
    </div>
  )
}

function Slider({ label, valor, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-pino">{label}</label>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-xs text-salvia">0</span>
        <input
          type="range"
          min="0"
          max="10"
          value={valor}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-pino"
        />
        <span className="text-xs text-salvia">10</span>
        <span className="font-serif text-2xl text-pino w-8 text-center">{valor}</span>
      </div>
    </div>
  )
}

function RangoFino({ label, valor, onChange }) {
  return (
    <label className="block text-sm">
      <span className="text-jade">{label}</span>
      <input
        type="range"
        min="0.1"
        max="1"
        step="0.05"
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-jade"
      />
    </label>
  )
}
