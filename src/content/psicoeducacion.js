// Contenido de onboarding y psicoeducación. Lenguaje sencillo, es-MX, sin alarmismo.
// Mensaje central: los síntomas son reales pero NO peligrosos; el patrón se puede reentrenar.

export const PASOS_ONBOARDING = [
  {
    id: 'bienvenida',
    titulo: 'Lo que eres no necesita arreglarse',
    cuerpo: [
      'Bienvenida, bienvenido. Esta app es un acompañamiento para vivir mejor con el PPPD: el mareo postural-perceptual persistente.',
      'No vamos con prisa. No hay nada roto en ti que haya que reparar. Hay un patrón que aprendió tu sistema de equilibrio, y los patrones se pueden reentrenar, despacio y con amabilidad.',
    ],
    nota: 'Esto es apoyo y autocuidado. No sustituye a tu médico ni a un especialista vestibular.',
  },
  {
    id: 'que-es',
    titulo: '¿Qué es el PPPD?',
    cuerpo: [
      'El PPPD es un mareo o inestabilidad que se queda muchos días, casi siempre peor de pie, al moverte o en lugares con mucho estímulo visual (tiendas, multitudes, pantallas con scroll, tráfico).',
      'Suele empezar después de algo concreto: un vértigo, una infección del oído, una migraña, un susto fuerte o una crisis de ansiedad. Eso pasa… pero el mareo se queda, aunque la causa original ya se haya resuelto.',
      'Es un trastorno funcional: no es daño en tu oído ni en tu cerebro. Es la forma de funcionar de las redes que unen equilibrio, vista y la señal de "cuidado".',
    ],
    tecnica: null,
  },
  {
    id: 'reales-no-peligrosos',
    titulo: 'Tus síntomas son reales, y no son peligrosos',
    cuerpo: [
      'Que sea funcional no significa que sea imaginario. El mareo que sientes es completamente real.',
      'Y al mismo tiempo: no es señal de que algo grave esté pasando en este momento. Tu cuerpo no está en peligro cuando te mareas en el súper. Es una falsa alarma de un sistema que se quedó en modo de alerta.',
      'Entender esto cambia mucho: cuando el mareo deja de leerse como amenaza, el sistema empieza a poder calmarse.',
    ],
    tecnica: 'tcc',
  },
  {
    id: 'dependencia-visual',
    titulo: 'Por qué los lugares "movidos" te marean más',
    cuerpo: [
      'Para mantener el equilibrio usamos tres fuentes: el oído interno, el cuerpo (propiocepción) y la vista. En el PPPD el sistema empieza a apoyarse demasiado en la vista. Es la dependencia visual.',
      'Por eso un pasillo de supermercado, una multitud o el scroll de una pantalla te desestabilizan: hay demasiada información visual en movimiento y choca con lo que dice tu equilibrio.',
      'La buena noticia: con exposición suave y graduada, el sistema vuelve a balancear sus fuentes. No huyendo de lo visual, sino reencontrándote con ello poco a poco.',
    ],
    tecnica: 'vrt',
  },
  {
    id: 'hipervigilancia',
    titulo: 'La trampa de vigilar tu propio equilibrio',
    cuerpo: [
      'Tras el susto inicial, el cerebro pone atención extra en cómo te balanceas y en cada sensación del cuerpo. Es la hipervigilancia.',
      'El detalle: prestar tanta atención al equilibrio lo empeora, igual que si piensas demasiado en cómo caminas, te trabas. Tu cuerpo sabe equilibrarse solo; el monitoreo constante le estorba.',
      'Una parte del trabajo es soltar esa vigilancia: redirigir la atención, aceptar las sensaciones sin pelearlas, y dejar que el sistema haga su parte.',
    ],
    tecnica: 'hipervigilancia',
  },
  {
    id: 'se-puede',
    titulo: 'El patrón se puede reentrenar',
    cuerpo: [
      'Lo que sostiene el PPPD —postura rígida, dependencia visual, hipervigilancia y un sistema atascado en alerta— es justo lo que se puede reentrenar.',
      'Las herramientas con más respaldo son la rehabilitación vestibular y la terapia cognitivo-conductual; a veces, medicación que valora tu médico. Esta app combina lo que puedes hacer tú: exposición suave, regulación, aceptación y entender lo que pasa.',
      'Sin prisa y sin culpa. Los días malos son parte del proceso, no un fracaso.',
    ],
    tecnica: 'vrt',
  },
]

// Texto de derivación / límites, reutilizable.
export const AVISO_MEDICO =
  'Esta app es apoyo y autocuidado, complemento de la atención profesional. No diagnostica, no prescribe y no sustituye a tu médico. Si no tienes un diagnóstico confirmado o tus síntomas cambian, consulta a un especialista vestibular.'
