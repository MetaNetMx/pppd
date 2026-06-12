import { useState } from 'react'
import { PASOS_ONBOARDING, AVISO_MEDICO } from '../content/psicoeducacion'
import { setPerfil } from '../lib/db'
import { tecnica } from '../lib/evidencia'
import EtiquetaEvidencia from '../components/EtiquetaEvidencia'
import Aviso from '../components/Aviso'
import NaturalezaScene from '../components/NaturalezaScene'
import { clsx } from '../lib/util'

const ESCENAS_ONBOARDING = ['lago', 'campo', 'bosque', 'olas', 'piedra', 'noche']

export default function Onboarding({ onListo }) {
  const [i, setI] = useState(0)
  const paso = PASOS_ONBOARDING[i]
  const ultimo = i === PASOS_ONBOARDING.length - 1
  const tec = paso.tecnica ? tecnica(paso.tecnica) : null

  async function terminar() {
    const perfil = { onboardingHecho: true, creado: new Date().toISOString() }
    await setPerfil(perfil)
    onListo(perfil)
  }

  return (
    <div className="min-h-screen flex flex-col max-w-xl mx-auto px-6 py-8">
      {/* Progreso */}
      <div className="flex gap-1.5 mb-8">
        {PASOS_ONBOARDING.map((_, idx) => (
          <div
            key={idx}
            className={clsx(
              'h-1 flex-1 rounded-full transition',
              idx <= i ? 'bg-pino' : 'bg-salvia/30',
            )}
          />
        ))}
      </div>

      <div key={paso.id} className="flex-1 animate-aparece">
        <div className="rounded-3xl overflow-hidden mb-6 shadow-suave">
          <NaturalezaScene
            variante={ESCENAS_ONBOARDING[i % ESCENAS_ONBOARDING.length]}
            estatico
            className="h-28"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl mb-6 leading-tight">{paso.titulo}</h1>
        {tec && (
          <div className="mb-4">
            <EtiquetaEvidencia nivel={tec.nivel} />
            <span className="ml-2 text-xs text-salvia">{tec.nombre}</span>
          </div>
        )}
        <div className="space-y-4 text-lg text-jade/90">
          {paso.cuerpo.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
        {paso.nota && (
          <div className="mt-6">
            <Aviso>{paso.nota}</Aviso>
          </div>
        )}
        {ultimo && (
          <div className="mt-6">
            <Aviso tono="fuerte">{AVISO_MEDICO}</Aviso>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between gap-3 pt-8">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          className={clsx('boton-fantasma', i === 0 && 'invisible')}
        >
          Atrás
        </button>
        {ultimo ? (
          <button onClick={terminar} className="boton-primario">
            Empezar
          </button>
        ) : (
          <button onClick={() => setI((v) => v + 1)} className="boton-primario">
            Siguiente
          </button>
        )}
      </div>

      <button
        onClick={terminar}
        className="mt-4 text-center text-xs text-salvia hover:text-jade underline"
      >
        Saltar introducción
      </button>
    </div>
  )
}
