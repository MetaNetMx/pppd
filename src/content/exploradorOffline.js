// Explorador del detonante en modo GUIADO OFFLINE (sin IA, sin configurar nada).
// Flujo TCC-informado: una pregunta a la vez, refleja, reencuadra y guarda hallazgos.
// Se usa cuando no hay conexión con la IA, para que la app sea funcional para cualquiera.

// Palabras que disparan derivación a crisis (no es exhaustivo; ante duda, deriva).
export const SENALES_CRISIS = [
  'suicid',
  'matarme',
  'quitarme la vida',
  'no quiero vivir',
  'no quiero seguir',
  'hacerme daño',
  'lastimarme',
  'morirme',
  'desaparecer para siempre',
]

export function detectarCrisis(texto = '') {
  const t = texto.toLowerCase()
  return SENALES_CRISIS.some((s) => t.includes(s))
}

// Cada paso: pregunta, tipo de hallazgo que captura, reflejo (función del texto) y reencuadre.
export const PASOS_GUIADO = [
  {
    id: 'inicio',
    tipo: null,
    pregunta:
      'Hola. Vamos a explorar tu mareo con calma, una pregunta a la vez. Puedes parar cuando quieras. Para empezar: ¿cómo ha estado tu mareo o inestabilidad estos días?',
    reflejo: () => 'Gracias por contarme cómo va.',
    reencuadre: '',
  },
  {
    id: 'precipitante',
    tipo: 'precipitante',
    pregunta:
      '¿Recuerdas qué estaba pasando cuando empezó, o en qué momentos lo notas peor? (por ejemplo: de pie, al moverte, en lugares con mucho movimiento visual)',
    reflejo: (t) => `Anoto eso como una pista de cuándo aparece: “${recortar(t)}”.`,
    reencuadre:
      'Que tenga detonantes no significa que sea peligroso: es un sistema de equilibrio en alerta que responde a esas situaciones, y eso se puede reentrenar.',
  },
  {
    id: 'amenaza',
    tipo: 'amenaza',
    pregunta:
      'Cuando el mareo aparece, ¿qué es lo que más temes que signifique o que pueda pasar?',
    reflejo: (t) => `Entiendo ese miedo: “${recortar(t)}”. Tiene mucho sentido sentirlo.`,
    reencuadre:
      'Una cosa es la sensación (“siento que me voy a caer”) y otra lo que de verdad ocurre (rara vez te caes). El mareo del PPPD es real, pero no es una señal de peligro inmediato.',
  },
  {
    id: 'evitacion',
    tipo: 'evitacion',
    pregunta:
      '¿Hay lugares, actividades o cosas que has empezado a evitar, o cosas en las que te apoyas para sentirte seguro?',
    reflejo: (t) => `Tomo nota de lo que has ido evitando o de tus apoyos: “${recortar(t)}”.`,
    reencuadre:
      'Evitar calma a corto plazo, pero a la larga le enseña al sistema que esos lugares son peligrosos. Reencontrarte con ellos poco a poco es justo lo que reentrena el patrón.',
  },
  {
    id: 'hipervigilancia',
    tipo: 'hipervigilancia',
    pregunta:
      '¿Te descubres vigilando tu equilibrio o tus sensaciones del cuerpo durante el día? ¿Cuánto, dirías?',
    reflejo: (t) => `Lo registro: “${recortar(t)}”.`,
    reencuadre:
      'Prestar tanta atención al equilibrio paradójicamente lo empeora, como pensar demasiado en cómo caminas. Soltar esa vigilancia, poco a poco, le devuelve el trabajo a tu cuerpo, que sabe hacerlo solo.',
  },
  {
    id: 'fortaleza',
    tipo: 'fortaleza',
    pregunta:
      'Para cerrar: ¿qué te ha ayudado, aunque sea un poco, en tus mejores momentos? Algo que quieras conservar.',
    reflejo: (t) => `Qué bueno tener esto presente: “${recortar(t)}”.`,
    reencuadre: '',
  },
]

export const CIERRE_GUIADO =
  'Gracias por este rato de honestidad contigo. Recuerda: tus síntomas son reales pero no peligrosos, y el patrón se puede reentrenar. Un próximo paso pequeño podría ser tu ruta de hoy, sin exigirte de más. Aquí estaré cuando quieras volver.'

function recortar(t = '') {
  const s = t.trim().replace(/\s+/g, ' ')
  return s.length > 90 ? s.slice(0, 90) + '…' : s
}
