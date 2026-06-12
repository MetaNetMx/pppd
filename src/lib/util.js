// Utilidades compartidas.

export function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export function fechaCorta(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
  } catch {
    return iso
  }
}

export function fechaLarga(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  } catch {
    return iso
  }
}

export function clsx(...xs) {
  return xs.filter(Boolean).join(' ')
}

// --- Text-to-Speech neuronal del navegador (Web Speech API), respaldo es-MX ---
// Preparado y configurable. Si el dispositivo no tiene voz es-MX, usa es-* disponible.
export function vocesDisponibles() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  return window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('es'))
}

export function elegirVoz(preferida) {
  const voces = vocesDisponibles()
  if (!voces.length) return null
  if (preferida) {
    const m = voces.find((v) => v.name === preferida)
    if (m) return m
  }
  // Prioriza es-MX, luego es-419 / es-US, luego cualquiera en español.
  return (
    voces.find((v) => v.lang?.toLowerCase() === 'es-mx') ||
    voces.find((v) => /es-(419|us)/i.test(v.lang || '')) ||
    voces[0]
  )
}

export function hablar(texto, { voz, rate = 0.92, pitch = 1, onend } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onend?.()
    return null
  }
  const u = new SpeechSynthesisUtterance(texto)
  u.lang = voz?.lang || 'es-MX'
  if (voz) u.voice = voz
  u.rate = rate
  u.pitch = pitch
  if (onend) u.onend = onend
  window.speechSynthesis.speak(u)
  return u
}

export function detenerVoz() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
