import { useEffect, useRef } from 'react'

// Estímulos visuales en movimiento para la desensibilización visual graduada (parte de la VRT).
// Sustituye a la realidad virtual inmersiva [EMERGENTE] por estímulos controlados y graduables.
// Patrones (tipo): 'puntos' | 'barras' | 'tablero' | 'ondas'. velocidad/intensidad de 0 a 1.
// Se puede pausar al instante; respeta prefers-reduced-motion.
export default function PatronVisual({
  tipo = 'puntos',
  direccion = 'horizontal',
  velocidad = 0.5,
  intensidad = 0.5,
  activo = true,
}) {
  const ref = useRef(null)
  const raf = useRef(0)
  const t = useRef(0)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    function resize() {
      const r = canvas.getBoundingClientRect()
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    function frame() {
      const w = canvas.width
      const h = canvas.height
      ctx.fillStyle = '#F5EFE0'
      ctx.fillRect(0, 0, w, h)
      const v = velocidad * (reduce ? 0.25 : 1)
      const tick = t.current

      if (tipo === 'barras') dibujarBarras(ctx, w, h, dpr, tick, v, intensidad, direccion)
      else if (tipo === 'tablero') dibujarTablero(ctx, w, h, dpr, tick, v, intensidad)
      else if (tipo === 'ondas') dibujarOndas(ctx, w, h, dpr, tick, v, intensidad)
      else dibujarPuntos(ctx, w, h, dpr, tick, v, intensidad)

      if (activo) t.current += 1
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
    }
  }, [tipo, direccion, velocidad, intensidad, activo])

  return (
    <canvas
      ref={ref}
      className="w-full h-56 rounded-2xl border border-salvia/30"
      aria-label="Estímulo visual en movimiento para exposición graduada"
    />
  )
}

function dibujarPuntos(ctx, w, h, dpr, tick, v, intensidad) {
  const sep = 26 * dpr
  const radio = (2 + intensidad * 2.5) * dpr
  const d = (tick * v) % sep
  ctx.fillStyle = `rgba(78,126,122,${0.25 + intensidad * 0.45})`
  for (let y = -sep; y < h + sep; y += sep) {
    for (let x = -sep; x < w + sep; x += sep) {
      ctx.beginPath()
      ctx.arc(x + d, y + d * 0.6, radio, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// Barras optocinéticas: el estímulo clásico de la rehabilitación vestibular.
function dibujarBarras(ctx, w, h, dpr, tick, v, intensidad, direccion) {
  const ancho = (22 + (1 - intensidad) * 18) * dpr
  const paso = ancho * 2
  const d = (tick * v * 1.6) % paso
  ctx.fillStyle = `rgba(30,80,80,${0.35 + intensidad * 0.5})`
  if (direccion === 'vertical') {
    for (let y = -paso + d; y < h + paso; y += paso) ctx.fillRect(0, y, w, ancho)
  } else {
    for (let x = -paso + d; x < w + paso; x += paso) ctx.fillRect(x, 0, ancho, h)
  }
}

function dibujarTablero(ctx, w, h, dpr, tick, v, intensidad) {
  const c = (26 + (1 - intensidad) * 16) * dpr
  const d = (tick * v) % (c * 2)
  ctx.fillStyle = `rgba(78,126,122,${0.3 + intensidad * 0.45})`
  for (let y = -c * 2; y < h + c * 2; y += c) {
    for (let x = -c * 2; x < w + c * 2; x += c) {
      const fila = Math.floor((y + d) / c)
      const col = Math.floor((x + d) / c)
      if ((fila + col) % 2 === 0) ctx.fillRect(x + d, y + d, c, c)
    }
  }
}

// Ondas/flujo radial: expansión concéntrica (optic flow). Más exigente; para niveles altos.
function dibujarOndas(ctx, w, h, dpr, tick, v, intensidad) {
  const cx = w / 2
  const cy = h / 2
  const paso = 34 * dpr
  const d = (tick * v * 1.4) % paso
  ctx.lineWidth = (2 + intensidad * 2) * dpr
  const max = Math.hypot(w, h)
  for (let r = d; r < max; r += paso) {
    ctx.strokeStyle = `rgba(30,80,80,${(0.2 + intensidad * 0.5) * (1 - r / max)})`
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }
}
