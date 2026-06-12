import { TECNICAS, NIVELES } from '../lib/evidencia'
import EtiquetaEvidencia from '../components/EtiquetaEvidencia'
import Aviso from '../components/Aviso'

export default function PanelEvidencia() {
  const orden = ['VALIDADO', 'ADYUVANTE', 'EMERGENTE']
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl mb-1">Panel de evidencia</h1>
        <p className="text-jade/80">
          Transparencia total: qué tiene respaldo y qué es exploratorio. Cada técnica de la app se
          rastrea aquí.
        </p>
      </div>

      <div className="tarjeta p-4 space-y-2">
        {orden.map((id) => (
          <div key={id} className="flex items-start gap-3 text-sm">
            <EtiquetaEvidencia nivel={id} />
            <span className="text-jade/80">{NIVELES[id].descripcion}</span>
          </div>
        ))}
      </div>

      {orden.map((nivel) => (
        <div key={nivel} className="space-y-3">
          <h2 className="text-xl text-pino flex items-center gap-2">
            <EtiquetaEvidencia nivel={nivel} />
          </h2>
          {TECNICAS.filter((t) => t.nivel === nivel).map((t) => (
            <div key={t.id} className="tarjeta p-5">
              <h3 className="text-lg text-jade font-semibold">{t.nombre}</h3>
              <p className="text-sm text-pino/90 mt-1 italic">{t.porque}</p>
              <p className="text-sm text-jade/80 mt-2">{t.detalle}</p>
              <p className="text-xs text-salvia mt-2">{t.certeza}</p>
            </div>
          ))}
        </div>
      ))}

      <Aviso tono="fuerte">
        Incluso lo etiquetado como [VALIDADO] tiene una certeza de evidencia de moderada a baja: lo es
        por consenso clínico, no porque la evidencia sea definitiva. Lo [EMERGENTE] no se presenta
        como probado. Las decisiones médicas y de diagnóstico corresponden a tu especialista.
      </Aviso>

      <p className="text-xs text-salvia">
        Fuentes y cifras detalladas en el documento <strong>evidencia.md</strong> del proyecto
        (búsqueda verificada, jun 2026: Bárány Society 2017; revisiones sistemáticas y metaanálisis
        2025 en Frontiers y PMC).
      </p>
    </div>
  )
}
