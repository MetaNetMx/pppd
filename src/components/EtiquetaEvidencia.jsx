import { NIVELES } from '../lib/evidencia'
import { clsx } from '../lib/util'

// Muestra la etiqueta de evidencia ([VALIDADO]/[ADYUVANTE]/[EMERGENTE]).
export default function EtiquetaEvidencia({ nivel, className }) {
  const n = NIVELES[nivel]
  if (!n) return null
  return (
    <span className={clsx('etiqueta', n.color, className)} title={n.descripcion}>
      [{n.texto}]
    </span>
  )
}
