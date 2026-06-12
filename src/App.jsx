import { useEffect, useState } from 'react'
import { getPerfil, getConfig, getRutas } from './lib/db'
import { hoyISO } from './lib/util'
import Onboarding from './modules/Onboarding'
import RutaDiaria from './modules/RutaDiaria'
import Meditaciones from './modules/Meditaciones'
import Explorador from './modules/Explorador'
import Seguimiento from './modules/Seguimiento'
import PanelEvidencia from './modules/PanelEvidencia'
import Ajustes from './modules/Ajustes'
import ModalCrisis from './modules/ModalCrisis'
import ErrorBoundary from './components/ErrorBoundary'
import { clsx } from './lib/util'

const TABS = [
  { id: 'ruta', label: 'Hoy', icono: '🌿' },
  { id: 'meditaciones', label: 'Meditar', icono: '🎧' },
  { id: 'explorar', label: 'Explorar', icono: '💬' },
  { id: 'seguimiento', label: 'Avance', icono: '📈' },
  { id: 'evidencia', label: 'Evidencia', icono: '📚' },
]

export default function App() {
  const [tab, setTab] = useState('ruta')
  const [perfil, setPerfil] = useState(undefined) // undefined=cargando, null=sin onboarding
  const [ajustes, setAjustes] = useState(false)
  const [crisis, setCrisis] = useState(false)

  useEffect(() => {
    getPerfil().then((p) => setPerfil(p || null))
  }, [])

  // Recordatorio diario (local): al abrir la app, si está activo, ya pasó la hora,
  // no hiciste la ruta hoy y hay permiso de notificaciones, avisa con cariño una vez al día.
  useEffect(() => {
    if (!perfil?.onboardingHecho) return
    ;(async () => {
      const on = await getConfig('recordatorioOn', false)
      if (!on || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      const hora = await getConfig('recordatorioHora', '09:00')
      const ahora = new Date()
      const [h, m] = String(hora).split(':').map(Number)
      const pasoLaHora = ahora.getHours() > h || (ahora.getHours() === h && ahora.getMinutes() >= m)
      if (!pasoLaHora) return
      if (localStorage.getItem('rc-notif') === hoyISO()) return
      const rutas = await getRutas()
      if (rutas.some((r) => r.fecha === hoyISO())) return
      localStorage.setItem('rc-notif', hoyISO())
      new Notification('Ruta Calma', {
        body: 'Tu ruta de hoy te espera, sin prisa. 🌿',
      })
    })()
  }, [perfil])

  if (perfil === undefined) {
    return (
      <div className="min-h-screen grid place-items-center text-salvia">
        <p className="font-serif text-2xl text-pino animate-pulse">Ruta Calma</p>
      </div>
    )
  }

  // Onboarding obligatorio la primera vez (psicoeducación).
  if (!perfil?.onboardingHecho) {
    return <Onboarding onListo={(p) => setPerfil(p)} />
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Encabezado */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <button
          onClick={() => setTab('ruta')}
          className="font-serif text-2xl text-pino tracking-tight"
        >
          Ruta Calma
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCrisis(true)}
            className="text-xs font-bold text-jade bg-salvia/20 hover:bg-salvia/35 rounded-full px-3 py-1.5"
          >
            Momento difícil
          </button>
          <button
            onClick={() => setAjustes(true)}
            aria-label="Ajustes"
            className="w-9 h-9 grid place-items-center rounded-full bg-salvia/20 hover:bg-salvia/35 text-pino"
          >
            ⚙︎
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 px-5 pb-28 pt-2">
        <ErrorBoundary key={tab}>
          <div className="animate-aparece">
            {tab === 'ruta' && <RutaDiaria perfil={perfil} />}
            {tab === 'meditaciones' && <Meditaciones />}
            {tab === 'explorar' && <Explorador onCrisis={() => setCrisis(true)} />}
            {tab === 'seguimiento' && <Seguimiento />}
            {tab === 'evidencia' && <PanelEvidencia />}
          </div>
        </ErrorBoundary>
      </main>

      {/* Navegación inferior */}
      <nav className="fixed bottom-0 inset-x-0 max-w-2xl mx-auto bg-arena/95 backdrop-blur border-t border-salvia/25">
        <div className="grid grid-cols-5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition',
                tab === t.id ? 'text-pino' : 'text-salvia hover:text-jade',
              )}
            >
              <span className="text-xl leading-none">{t.icono}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {ajustes && <Ajustes onCerrar={() => setAjustes(false)} onPerfil={setPerfil} />}
      {crisis && <ModalCrisis onCerrar={() => setCrisis(false)} />}
    </div>
  )
}
