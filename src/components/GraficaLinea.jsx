import { fechaCorta } from '../lib/util'

// Gráfica de línea minimalista en SVG (sin dependencias). Muestra evolución de un score.
// puntos: [{fecha, valor}], max: valor máximo del eje.
export default function GraficaLinea({ puntos = [], max = 100, color = '#1E5050', etiqueta }) {
  if (!puntos.length) {
    return (
      <p className="text-sm text-salvia italic py-8 text-center">
        Aún no hay datos suficientes. Tu primera medición aparecerá aquí.
      </p>
    )
  }
  const W = 320
  const H = 140
  const pad = 28
  const n = puntos.length
  const x = (i) => (n === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (n - 1))
  const y = (v) => H - pad - (Math.min(v, max) / max) * (H - pad * 2)

  const linea = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.valor)}`).join(' ')

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto" role="img" aria-label={etiqueta}>
        {/* eje base */}
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#8A9E9A" strokeWidth="1" opacity="0.4" />
        {/* línea de datos */}
        <path d={linea} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {puntos.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.valor)} r="4" fill={color} />
            {(i === 0 || i === n - 1 || n <= 6) && (
              <text x={x(i)} y={H - pad + 14} textAnchor="middle" fontSize="9" fill="#8A9E9A">
                {fechaCorta(p.fecha)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
