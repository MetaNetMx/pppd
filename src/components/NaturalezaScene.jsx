// Escenas de naturaleza en SVG, bundleadas (offline, sin imágenes externas ni licencias).
// Paleta de marca, minimalistas y calmadas. Una sola capa con movimiento muy lento
// (se detiene con prefers-reduced-motion, importante para PPPD).

const VARIANTES = {
  lago: LagoNiebla,
  olas: Olas,
  bosque: Bosque,
  campo: Campo,
  noche: Noche,
  piedra: Piedra,
  generico: Campo,
}

export function escenaPorPaisaje(texto = '') {
  const t = texto.toLowerCase()
  if (/(lago|niebla|espejo|estanque)/.test(t)) return 'lago'
  if (/(ola|mar|playa|orilla|océano|oceano|agua)/.test(t)) return 'olas'
  if (/(bosque|árbol|arbol|pino|selva|hoja)/.test(t)) return 'bosque'
  if (/(noche|estrella|luna|cielo nocturno)/.test(t)) return 'noche'
  if (/(piedra|roca|arroyo|río|rio)/.test(t)) return 'piedra'
  if (/(campo|pradera|hierba|valle|monte|colina)/.test(t)) return 'campo'
  return 'generico'
}

export default function NaturalezaScene({ variante = 'generico', className = '', estatico = false }) {
  const Comp = VARIANTES[variante] || VARIANTES.generico
  // estatico: sin movimiento (para fondos de navegación; en PPPD el movimiento amplio molesta).
  return (
    <div className={`relative overflow-hidden ${estatico ? 'escena-estatica' : ''} ${className}`}>
      <Comp />
    </div>
  )
}

const SVG = ({ children }) => (
  <svg
    viewBox="0 0 400 240"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full block"
    aria-hidden="true"
  >
    {children}
  </svg>
)

function LagoNiebla() {
  return (
    <SVG>
      <defs>
        <linearGradient id="lagoCielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cdd9d2" />
          <stop offset="1" stopColor="#8A9E9A" />
        </linearGradient>
        <linearGradient id="lagoAgua" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4E7E7A" />
          <stop offset="1" stopColor="#163D3D" />
        </linearGradient>
      </defs>
      <rect width="400" height="150" fill="url(#lagoCielo)" />
      <circle cx="300" cy="60" r="34" fill="#F5EFE0" opacity="0.85" />
      {/* montañas */}
      <path d="M0 150 L80 80 L150 150 Z" fill="#6e857f" opacity="0.7" />
      <path d="M110 150 L210 70 L320 150 Z" fill="#5f7a74" opacity="0.8" />
      <rect y="150" width="400" height="90" fill="url(#lagoAgua)" />
      {/* niebla que se desplaza muy lento */}
      <g className="drift-slow" opacity="0.5">
        <ellipse cx="120" cy="135" rx="120" ry="10" fill="#F5EFE0" opacity="0.4" />
        <ellipse cx="300" cy="128" rx="90" ry="7" fill="#F5EFE0" opacity="0.35" />
      </g>
      <ellipse cx="300" cy="185" rx="22" ry="6" fill="#F5EFE0" opacity="0.3" />
    </SVG>
  )
}

function Olas() {
  return (
    <SVG>
      <defs>
        <linearGradient id="olaCielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7ddc8" />
          <stop offset="1" stopColor="#b9c3bb" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#olaCielo)" />
      <circle cx="320" cy="70" r="40" fill="#F5EFE0" opacity="0.7" />
      <path d="M0 120 Q100 100 200 120 T400 120 V240 H0 Z" fill="#8A9E9A" opacity="0.8" />
      <path d="M0 150 Q100 132 200 150 T400 150 V240 H0 Z" fill="#4E7E7A" opacity="0.9" />
      <g className="drift-slow">
        <path d="M0 185 Q100 168 200 185 T400 185 V240 H0 Z" fill="#1E5050" />
      </g>
      <path d="M0 215 Q100 205 200 215 T400 215 V240 H0 Z" fill="#163D3D" />
    </SVG>
  )
}

function Bosque() {
  const pinos = []
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 45
    const h = 70 + ((i * 37) % 40)
    const tono = i % 2 ? '#1E5050' : '#163D3D'
    pinos.push(
      <g key={i} opacity={0.85 - (i % 3) * 0.1}>
        <polygon points={`${x},${240 - h} ${x - 22},240 ${x + 22},240`} fill={tono} />
        <polygon points={`${x},${240 - h - 20} ${x - 16},${240 - h + 14} ${x + 16},${240 - h + 14}`} fill={tono} />
      </g>,
    )
  }
  return (
    <SVG>
      <rect width="400" height="240" fill="#e7ddc8" />
      {/* haces de luz */}
      <g className="drift-slow" opacity="0.25">
        <polygon points="120,0 160,0 90,240 40,240" fill="#F5EFE0" />
        <polygon points="240,0 270,0 220,240 180,240" fill="#F5EFE0" />
      </g>
      {pinos}
    </SVG>
  )
}

function Campo() {
  return (
    <SVG>
      <defs>
        <linearGradient id="campoCielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ead9c0" />
          <stop offset="1" stopColor="#cdd3c2" />
        </linearGradient>
      </defs>
      <rect width="400" height="160" fill="url(#campoCielo)" />
      <circle cx="70" cy="60" r="30" fill="#F5EFE0" opacity="0.8" />
      <path d="M0 160 Q200 120 400 160 V240 H0 Z" fill="#8A9E9A" />
      <path d="M0 185 Q200 155 400 185 V240 H0 Z" fill="#4E7E7A" />
      {/* hierba meciéndose */}
      <g className="sway" style={{ transformOrigin: '200px 240px' }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const x = 10 + i * 16
          return (
            <path
              key={i}
              d={`M${x} 240 Q${x + 4} 205 ${x + 1} 188`}
              stroke="#1E5050"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          )
        })}
      </g>
    </SVG>
  )
}

function Noche() {
  return (
    <SVG>
      <defs>
        <linearGradient id="nocheCielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E5050" />
          <stop offset="1" stopColor="#163D3D" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#nocheCielo)" />
      <circle cx="310" cy="55" r="26" fill="#F5EFE0" opacity="0.9" />
      <circle cx="298" cy="50" r="26" fill="#163D3D" />
      <g fill="#F5EFE0" className="twinkle">
        {[
          [40, 40], [90, 70], [140, 35], [190, 80], [60, 110], [240, 50], [160, 100], [110, 120],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} opacity="0.85" />
        ))}
      </g>
      <path d="M0 175 L90 120 L170 175 Z" fill="#0f2e2e" />
      <path d="M120 190 L240 110 L360 190 Z" fill="#0c2727" />
      <rect y="188" width="400" height="52" fill="#0a2121" />
    </SVG>
  )
}

function Piedra() {
  return (
    <SVG>
      <rect width="400" height="240" fill="#dfd6c0" />
      <path d="M0 120 Q120 100 200 120 T400 120 V240 H0 Z" fill="#8A9E9A" opacity="0.6" />
      {/* arroyo */}
      <g className="drift-slow" opacity="0.7">
        <path d="M0 170 Q120 150 200 170 T400 170 V210 H0 Z" fill="#4E7E7A" />
      </g>
      <path d="M0 205 Q120 195 200 205 T400 205 V240 H0 Z" fill="#1E5050" />
      {/* piedra firme */}
      <ellipse cx="200" cy="175" rx="60" ry="34" fill="#5d6b66" />
      <ellipse cx="200" cy="168" rx="60" ry="30" fill="#6e7d77" />
      <ellipse cx="150" cy="195" rx="30" ry="16" fill="#566460" />
    </SVG>
  )
}
