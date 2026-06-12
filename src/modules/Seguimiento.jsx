import { useEffect, useMemo, useState } from 'react'
import {
  DHI_ITEMS,
  DHI_OPCIONES,
  NPQ_ITEMS,
  NPQ_ESCALA,
  puntuarDHI,
  puntuarNPQ,
  interpretarDHI,
} from '../content/autoreporte'
import { addEntradaDiario, getDiario, addAutoreporte, getAutoreportes, getRutas } from '../lib/db'
import { hoyISO, fechaLarga } from '../lib/util'
import { calcularRacha } from '../lib/progreso'
import { exportarInformePDF } from '../lib/informe'
import GraficaLinea from '../components/GraficaLinea'
import Aviso from '../components/Aviso'

export default function Seguimiento() {
  const [pestana, setPestana] = useState('avance')

  return (
    <div className="space-y-5">
      <h1 className="text-3xl">Tu avance</h1>
      <div className="flex gap-2">
        {[
          ['avance', 'Evolución'],
          ['diario', 'Diario'],
          ['reporte', 'Autorreporte'],
        ].map(([id, t]) => (
          <button
            key={id}
            onClick={() => setPestana(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              pestana === id ? 'bg-pino text-arena' : 'bg-salvia/20 text-jade'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {pestana === 'avance' && <Evolucion />}
      {pestana === 'diario' && <Diario />}
      {pestana === 'reporte' && <Autorreporte />}
    </div>
  )
}

function Evolucion() {
  const [reportes, setReportes] = useState([])
  const [diario, setDiario] = useState([])
  const [rutas, setRutas] = useState([])

  useEffect(() => {
    getAutoreportes().then(setReportes)
    getDiario().then(setDiario)
    getRutas().then(setRutas)
  }, [])

  const dhiPuntos = reportes.filter((r) => r.dhi != null).map((r) => ({ fecha: r.fecha, valor: r.dhi }))
  const npqPuntos = reportes.filter((r) => r.npq != null).map((r) => ({ fecha: r.fecha, valor: r.npq }))
  const malestar = diario
    .filter((d) => d.malestar != null)
    .map((d) => ({ fecha: d.fecha, valor: d.malestar }))

  const rutas30 = rutas.filter((r) => {
    const dias = (Date.now() - new Date(r.fecha).getTime()) / 86400000
    return dias <= 30
  }).length
  const racha = calcularRacha(rutas)

  return (
    <div className="space-y-5">
      {/* Racha (sin culpa) */}
      <div className="tarjeta p-5 flex items-center gap-4">
        <div className="text-4xl">{racha.actual > 0 ? '🌿' : '🌱'}</div>
        <div className="flex-1">
          <p className="font-serif text-2xl text-pino leading-none">
            {racha.actual > 0
              ? `${racha.actual} ${racha.actual === 1 ? 'día' : 'días'} de constancia`
              : 'Hoy es un buen día para empezar'}
          </p>
          <p className="text-xs text-salvia mt-1">
            {racha.mejor > 0 ? `Tu mejor racha: ${racha.mejor} días. ` : ''}
            Saltarte un día no borra tu avance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tarjeta titulo="Rutas (30 días)" valor={rutas30} />
        <Tarjeta titulo="Registros de diario" valor={diario.length} />
      </div>

      <button onClick={() => exportarInformePDF()} className="boton-suave w-full">
        Exportar informe (PDF) para mi especialista
      </button>

      <div className="tarjeta p-5">
        <p className="font-semibold text-pino mb-1">Impacto del mareo (DHI corto)</p>
        <p className="text-xs text-salvia mb-3">0 = sin impacto · 100 = impacto alto. Baja = mejora.</p>
        <GraficaLinea puntos={dhiPuntos} max={100} color="#1E5050" etiqueta="Evolución DHI" />
      </div>

      <div className="tarjeta p-5">
        <p className="font-semibold text-pino mb-1">Síntomas por detonante (NPQ corto)</p>
        <p className="text-xs text-salvia mb-3">0–36. Baja = mejora en postura, movimiento y visual.</p>
        <GraficaLinea puntos={npqPuntos} max={36} color="#4E7E7A" etiqueta="Evolución NPQ" />
      </div>

      <div className="tarjeta p-5">
        <p className="font-semibold text-pino mb-1">Malestar diario</p>
        <p className="text-xs text-salvia mb-3">Tu registro rápido de cada día (0–10).</p>
        <GraficaLinea puntos={malestar} max={10} color="#8A9E9A" etiqueta="Malestar diario" />
      </div>

      {reportes.length >= 2 && <ConexionProgreso reportes={reportes} rutas={rutas} />}
    </div>
  )
}

// Conecta el progreso con la intensidad de la ruta (mensaje, no diagnóstico).
function ConexionProgreso({ reportes, rutas }) {
  const primero = reportes[0]?.dhi
  const ultimo = reportes[reportes.length - 1]?.dhi
  if (primero == null || ultimo == null) return null
  const dif = primero - ultimo
  const nivelProm =
    rutas.length > 0 ? (rutas.reduce((a, r) => a + (r.nivel || 1), 0) / rutas.length).toFixed(1) : '—'

  let texto
  if (dif >= 10)
    texto = `Tu DHI bajó ${Math.round(dif)} puntos desde tu primer reporte. Mantener la ruta (intensidad media ${nivelProm}/3) parece estar acompañando esa mejora. Sin prisa: sigue subiendo la exposición poco a poco.`
  else if (dif <= -10)
    texto = `Tu DHI subió ${Math.round(-dif)} puntos. Puede ser una racha difícil, y está bien. Considera bajar la intensidad de la ruta unos días y, si se sostiene, coméntalo con tu especialista.`
  else
    texto = `Tu DHI se mantiene estable. La estabilidad también es información útil. Intensidad media de tu ruta: ${nivelProm}/3.`

  return <Aviso>{texto}</Aviso>
}

function Tarjeta({ titulo, valor }) {
  return (
    <div className="tarjeta p-4 text-center">
      <p className="font-serif text-4xl text-pino">{valor}</p>
      <p className="text-xs text-salvia mt-1">{titulo}</p>
    </div>
  )
}

function Diario() {
  const [diario, setDiario] = useState([])
  const [malestar, setMalestar] = useState(5)
  const [nota, setNota] = useState('')
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    getDiario().then((d) => setDiario([...d].reverse()))
  }, [])

  async function guardar() {
    await addEntradaDiario({
      fecha: hoyISO(),
      ts: new Date().toISOString(),
      tipo: 'diario',
      malestar: Number(malestar),
      nota: nota.trim(),
    })
    setNota('')
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
    getDiario().then((d) => setDiario([...d].reverse()))
  }

  return (
    <div className="space-y-5">
      <div className="tarjeta p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-pino">¿Cuánto mareo o malestar hoy?</label>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-salvia">0</span>
            <input
              type="range"
              min="0"
              max="10"
              value={malestar}
              onChange={(e) => setMalestar(e.target.value)}
              className="flex-1 accent-pino"
            />
            <span className="text-xs text-salvia">10</span>
            <span className="font-serif text-2xl text-pino w-8 text-center">{malestar}</span>
          </div>
        </div>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={3}
          placeholder="¿Algo que quieras anotar? Un detonante, un logro, cómo te sentiste… (opcional)"
          className="w-full resize-none rounded-2xl border border-salvia/30 bg-white/70 px-4 py-3 text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
        />
        <button onClick={guardar} className="boton-primario w-full">
          {guardado ? 'Guardado 🤍' : 'Guardar en mi diario'}
        </button>
      </div>

      <div className="space-y-2">
        {diario.length === 0 && (
          <p className="text-sm text-salvia italic text-center py-4">
            Tu diario está vacío. Cada registro te ayudará a ver patrones con el tiempo.
          </p>
        )}
        {diario.slice(0, 30).map((d, i) => (
          <div key={i} className="tarjeta p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-salvia">{fechaLarga(d.fecha)}</span>
              {d.malestar != null && (
                <span className="text-xs font-bold text-pino bg-salvia/20 rounded-full px-2 py-0.5">
                  malestar {d.malestar}/10
                </span>
              )}
            </div>
            {d.nota && <p className="text-jade text-sm mt-1">{d.nota}</p>}
            {d.tipo === 'ruta' && !d.nota && (
              <p className="text-jade/70 text-sm mt-1 italic">Completaste tu ruta (nivel {d.nivel}).</p>
            )}
            {d.tipo === 'exposicion' && (
              <p className="text-jade/70 text-sm mt-1 italic">
                Exposición visual nivel {d.nivel} ({d.patron}): malestar {d.antes} → {d.despues}.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Autorreporte() {
  const [dhi, setDhi] = useState({})
  const [npq, setNpq] = useState({})
  const [enviado, setEnviado] = useState(false)

  const dhiCompleto = DHI_ITEMS.every((it) => dhi[it.id] != null)
  const npqCompleto = NPQ_ITEMS.every((it) => npq[it.id] != null)

  const dhiScore = useMemo(() => (dhiCompleto ? puntuarDHI(dhi) : null), [dhi, dhiCompleto])
  const npqScore = useMemo(() => (npqCompleto ? puntuarNPQ(npq) : null), [npq, npqCompleto])

  async function guardar() {
    await addAutoreporte({
      fecha: hoyISO(),
      ts: new Date().toISOString(),
      dhi: dhiScore,
      npq: npqScore,
      dhiRespuestas: dhi,
      npqRespuestas: npq,
    })
    setEnviado(true)
  }

  if (enviado) {
    const interp = dhiScore != null ? interpretarDHI(dhiScore) : null
    return (
      <div className="space-y-4 text-center py-4">
        <div className="text-4xl">📈</div>
        <h2 className="text-2xl">Guardado</h2>
        {dhiScore != null && (
          <p className="text-jade">
            DHI corto: <strong className="text-pino">{dhiScore}/100</strong>
            {interp && ` · ${interp.texto}`}
          </p>
        )}
        {npqScore != null && (
          <p className="text-jade">
            NPQ corto: <strong className="text-pino">{npqScore}/36</strong>
          </p>
        )}
        <p className="text-sm text-salvia max-w-sm mx-auto">
          Verás cómo evoluciona en la pestaña Evolución. Hazlo cada 1–2 semanas para notar tendencias.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Aviso>
        Autorreporte breve de seguimiento, inspirado en escalas clínicas (DHI y NPQ). No es un
        diagnóstico ni la escala completa: sirve para que <em>tú</em> veas tu evolución.
      </Aviso>

      <div className="tarjeta p-5 space-y-4">
        <p className="font-semibold text-pino">Impacto del mareo (últimas 2 semanas)</p>
        {DHI_ITEMS.map((it) => (
          <div key={it.id}>
            <p className="text-sm text-jade mb-2">{it.texto}</p>
            <div className="flex gap-2">
              {DHI_OPCIONES.map((o) => (
                <button
                  key={o.valor}
                  onClick={() => setDhi((s) => ({ ...s, [it.id]: o.valor }))}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
                    dhi[it.id] === o.valor ? 'bg-pino text-arena' : 'bg-salvia/20 text-jade'
                  }`}
                >
                  {o.texto}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="tarjeta p-5 space-y-4">
        <p className="font-semibold text-pino">Síntomas por situación</p>
        {NPQ_ITEMS.map((it) => (
          <div key={it.id}>
            <p className="text-sm text-jade mb-2">{it.texto}</p>
            <div className="flex flex-wrap gap-1.5">
              {NPQ_ESCALA.map((o) => (
                <button
                  key={o.valor}
                  onClick={() => setNpq((s) => ({ ...s, [it.id]: o.valor }))}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    npq[it.id] === o.valor ? 'bg-jade text-arena' : 'bg-salvia/20 text-jade'
                  }`}
                  title={o.texto}
                >
                  {o.valor}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-salvia">0 = nunca · 6 = siempre</p>
      </div>

      <button
        onClick={guardar}
        disabled={!dhiCompleto && !npqCompleto}
        className="boton-primario w-full disabled:opacity-40"
      >
        Guardar autorreporte
      </button>
    </div>
  )
}
