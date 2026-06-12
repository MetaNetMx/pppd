// Autorreporte simplificado inspirado en DHI (Dizziness Handicap Inventory) y
// NPQ (Niigata PPPD Questionnaire). NO es la escala clínica completa ni un instrumento
// diagnóstico: es una versión corta de autoseguimiento para que la persona vea su evolución.
//
// DHI corto: 7 ítems (mezcla de funcional, emocional y físico). Respuestas: No(0) / A veces(2) / Sí(4).
//   Total 0–28, reescalado a 0–100 para comparabilidad orientativa con el DHI clásico.
// NPQ corto: 6 ítems sobre los 3 factores provocadores del PPPD (postura/marcha, movimiento, visual).
//   Escala 0–6 por ítem. Total 0–36.

export const DHI_OPCIONES = [
  { texto: 'No', valor: 0 },
  { texto: 'A veces', valor: 2 },
  { texto: 'Sí', valor: 4 },
]

export const DHI_ITEMS = [
  { id: 'd1', sub: 'F', texto: 'Por el mareo, ¿se te dificulta caminar por la calle o ir de compras?' },
  { id: 'd2', sub: 'F', texto: '¿Evitas lugares con mucha gente o estímulo visual por el mareo?' },
  { id: 'd3', sub: 'E', texto: '¿El mareo te hace sentir frustración o tristeza?' },
  { id: 'd4', sub: 'E', texto: '¿Tienes miedo de que la gente piense que algo anda mal contigo?' },
  { id: 'd5', sub: 'F', texto: '¿El mareo limita tu vida social o tus actividades?' },
  { id: 'd6', sub: 'P', texto: '¿Mover la cabeza rápido aumenta tu mareo?' },
  { id: 'd7', sub: 'E', texto: '¿Te sientes con poca energía o concentración por el mareo?' },
]

export const NPQ_ITEMS = [
  { id: 'n1', factor: 'postura', texto: 'Estar de pie o caminar empeora mi mareo.' },
  { id: 'n2', factor: 'postura', texto: 'Mantener una postura erguida un buen rato me desestabiliza.' },
  { id: 'n3', factor: 'movimiento', texto: 'Moverme yo, o que me muevan (auto, transporte), aumenta el mareo.' },
  { id: 'n4', factor: 'movimiento', texto: 'Los movimientos de mi propio cuerpo me marean.' },
  { id: 'n5', factor: 'visual', texto: 'Lugares con mucho movimiento visual (tiendas, multitudes, pantallas) me marean.' },
  { id: 'n6', factor: 'visual', texto: 'Patrones visuales complejos (rayas, estanterías llenas) me desestabilizan.' },
]

// NPQ: frecuencia 0–6
export const NPQ_ESCALA = [
  { texto: 'Nunca', valor: 0 },
  { texto: 'Casi nunca', valor: 1 },
  { texto: 'A veces', valor: 2 },
  { texto: 'Con frecuencia', valor: 3 },
  { texto: 'Muy seguido', valor: 4 },
  { texto: 'Casi siempre', valor: 5 },
  { texto: 'Siempre', valor: 6 },
]

export function puntuarDHI(respuestas) {
  const crudo = DHI_ITEMS.reduce((acc, it) => acc + (respuestas[it.id] ?? 0), 0)
  const max = DHI_ITEMS.length * 4
  return Math.round((crudo / max) * 100) // 0–100 orientativo
}

export function puntuarNPQ(respuestas) {
  return NPQ_ITEMS.reduce((acc, it) => acc + (respuestas[it.id] ?? 0), 0) // 0–36
}

export function interpretarDHI(score) {
  if (score <= 30) return { nivel: 'leve', texto: 'Impacto leve' }
  if (score <= 60) return { nivel: 'moderado', texto: 'Impacto moderado' }
  return { nivel: 'alto', texto: 'Impacto considerable' }
}
