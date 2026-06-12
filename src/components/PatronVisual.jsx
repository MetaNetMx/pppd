import { useEffect, useRef } from 'react'

// Patrón visual en movimiento para la desensibilización visual graduada (parte de la VRT).
// Sustituye a la realidad virtual inmersiva [EMERGENTE] por un estímulo controlado y
// graduable en pantalla. velocidad e intensidad van de 0 a 1. Se puede pausar al instante.
export default function PatronVisual({ velocidad = 0.5, intensidad = 0.5, activo = true }) {
  const ref = useRef(null)
  const raf = useRef(0)
  const t = useRef(0)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const r = canvas.getBoundingClientRect()
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    function frame() {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      // Fondo arena
      ctx.fillStyle = '#F5EFE0'
      ctx.fillRect(0, 0, w, h)

      // Rejilla de puntos que se desplaza (estímulo optocinético suave).
      const sep = 26 * dpr
      const radio = (2 + intensidad * 2.5) * dpr
      const desplaz = (t.current * velocidad * (reduce ? 0.2 : 1)) % sep
      ctx.fillStyle = `rgba(78,126,122,${0.25 + intensidad * 0.45})`
      for (let y = -sep; y < h + sep; y += sep) {
        for (let x = -sep; x < w + sep; x += sep) {
          ctx.beginPath()
          ctx.arc(x + desplaz, y + desplaz * 0.6, radio, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (activo) t.current += 1
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
    }
  }, [velocidad, intensidad, activo])

  return (
    <canvas
      ref={ref}
      className="w-full h-48 rounded-2xl border border-salvia/30"
      aria-label="Patrón visual en movimiento para exposición graduada"
    />
  )
}
