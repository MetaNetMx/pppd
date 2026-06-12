// Definición de la "Ruta de alivio diaria": secuencia corta (<10 min) y ADAPTATIVA.
//
// Cada paso tiene 3 niveles de intensidad (1=suave, 2=media, 3=mayor). La app elige el
// nivel según el "estado del día" que reporta la persona y su historial reciente:
//   - día malo  -> baja la intensidad
//   - día normal -> mantiene
//   - día bueno / con avance -> sube exposición de forma gradual
// Cero culpa si falla un día: el día malo SIEMPRE baja, nunca penaliza.

export const PASOS_RUTA = [
  {
    id: 'check-in',
    nombre: 'Cómo llegas hoy',
    tecnica: null,
    icono: '🌤️',
    descripcion: 'Un momento para notar cómo estás, sin juzgarlo.',
    // Este paso es el check-in; su contenido se maneja en el módulo.
    niveles: {
      1: { duracionSeg: 30, guia: 'Solo nota cómo estás hoy. No tienes que cambiar nada.' },
      2: { duracionSeg: 30, guia: 'Nota cómo estás hoy y ponle un número, sin juzgarlo.' },
      3: { duracionSeg: 30, guia: 'Nota cómo estás y qué tono trae el día.' },
    },
  },
  {
    id: 'grounding',
    nombre: 'Anclar',
    tecnica: 'respiracion',
    icono: '🪨',
    descripcion: 'Respiración con salida larga para bajar la alerta del cuerpo.',
    niveles: {
      1: {
        duracionSeg: 60,
        guia: 'Tres respiraciones lentas. Entra suave por la nariz, y suelta el aire largo. Suelta los hombros.',
      },
      2: {
        duracionSeg: 90,
        guia: 'Respira entrando en 4 y saliendo en 6, durante un minuto y medio. La salida larga le dice a tu cuerpo que puede bajar la guardia.',
      },
      3: {
        duracionSeg: 120,
        guia: 'Dos minutos de respiración 4-6. Mientras respiras, nota que no necesitas vigilar tu equilibrio: tu cuerpo se sostiene solo.',
      },
    },
  },
  {
    id: 'gaze',
    nombre: 'Estabilizar la mirada',
    tecnica: 'vrt',
    icono: '👁️',
    descripcion: 'Ejercicio de estabilización de la mirada (reflejo vestíbulo-ocular).',
    niveles: {
      1: {
        duracionSeg: 45,
        guia: 'Mira un punto fijo frente a ti. Solo sostén la mirada, tranquilo, durante unos segundos. Si quieres, parpadea normal.',
      },
      2: {
        duracionSeg: 60,
        guia: 'Fija la mirada en un punto y gira la cabeza MUY despacio de lado a lado, manteniendo la vista en el punto. Pequeño, lento.',
      },
      3: {
        duracionSeg: 75,
        guia: 'Mirada en el punto fijo, gira la cabeza lado a lado y luego arriba-abajo, siempre lento. Si marea un poco, es parte del entreno; baja el ritmo, no pares de golpe.',
      },
    },
  },
  {
    id: 'visual',
    nombre: 'Exposición visual',
    tecnica: 'vrt',
    icono: '🌾',
    descripcion: 'Desensibilización visual graduada con movimiento suave.',
    // Este paso usa el componente de exposición visual (patrón en movimiento configurable).
    usaPatronVisual: true,
    niveles: {
      1: {
        duracionSeg: 30,
        guia: 'Observa el movimiento muy suave en pantalla durante medio minuto. Si es demasiado, cierra los ojos y respira: eso también cuenta.',
        velocidad: 0.3,
        intensidad: 0.25,
      },
      2: {
        duracionSeg: 45,
        guia: 'Sigue el movimiento un poco más marcado. Mantente con él sin huir; estás enseñando a tu cerebro que el movimiento visual es seguro.',
        velocidad: 0.6,
        intensidad: 0.5,
      },
      3: {
        duracionSeg: 60,
        guia: 'Movimiento más amplio durante un minuto. Quédate con la sensación, respirando. Puedes pausar cuando lo necesites.',
        velocidad: 1,
        intensidad: 0.8,
      },
    },
  },
  {
    id: 'aceptacion',
    nombre: 'Aceptar',
    tecnica: 'mindfulness',
    icono: '🍃',
    descripcion: 'Un momento de aceptación: hacerle espacio a la sensación en vez de pelearla.',
    niveles: {
      1: {
        duracionSeg: 45,
        guia: 'Nota cualquier sensación de mareo y, en vez de empujarla, hazle un poco de espacio. Es real y no es peligrosa.',
      },
      2: {
        duracionSeg: 60,
        guia: 'Deja estar la sensación, como quien deja pasar el clima. No tienes que arreglarla ahora. Respira a su lado.',
      },
      3: {
        duracionSeg: 60,
        guia: 'Observa la sensación con curiosidad amable, sin etiquetarla de buena o mala. Solo está, y tú sigues aquí, entero.',
      },
    },
  },
  {
    id: 'reto',
    nombre: 'Reto del día',
    tecnica: 'hipervigilancia',
    icono: '🌱',
    descripcion: 'Un reto conductual mínimo para reducir la evitación, a tu medida.',
    // Las sugerencias se eligen según el nivel; la persona puede aceptar otro.
    niveles: {
      1: {
        duracionSeg: 0,
        guia: 'Hoy, un paso muy pequeño contra la evitación. Por ejemplo:',
        retos: [
          'Pararte junto a una ventana con movimiento afuera, 20 segundos.',
          'Caminar de una habitación a otra sin apoyarte en la pared.',
          'Ver un video corto con algo de movimiento, sentado.',
        ],
      },
      2: {
        duracionSeg: 0,
        guia: 'Un reto pequeño para recuperar terreno. Por ejemplo:',
        retos: [
          'Salir a la banqueta y caminar una cuadra a paso tranquilo.',
          'Entrar a una tienda pequeña 2 minutos, aunque haya algo de estímulo.',
          'Subir o bajar unas escaleras mirando al frente, no a los pies.',
        ],
      },
      3: {
        duracionSeg: 0,
        guia: 'Hoy te sientes con más margen. Un reto algo mayor, sin pasarte:',
        retos: [
          'Pasar por un pasillo de supermercado a ritmo normal.',
          'Una caminata de 10 minutos en un lugar con gente.',
          'Hacer un mandado breve que venías posponiendo.',
        ],
      },
    },
  },
  {
    id: 'cierre',
    nombre: 'Cerrar bien',
    tecnica: null,
    icono: '🤍',
    descripcion: 'Reconocer lo que hiciste, sin exigirte de más.',
    niveles: {
      1: { duracionSeg: 20, guia: 'Hiciste algo por ti hoy, aunque fuera poco. Eso cuenta. Date las gracias.' },
      2: { duracionSeg: 20, guia: 'Terminaste tu ruta. No importa cómo salió; importa que volviste. Date las gracias.' },
      3: { duracionSeg: 20, guia: 'Buen trabajo hoy. Reconócelo sin exigirte el doble mañana. El avance es lento y está bien.' },
    },
  },
]

// Lógica adaptativa: decide el nivel global (1-3) de la sesión.
// estadoHoy: 'malo' | 'normal' | 'bueno'
// nivelPrevio: último nivel usado (1-3), null si es la primera vez
export function decidirNivel(estadoHoy, nivelPrevio) {
  const base = nivelPrevio || 1
  if (estadoHoy === 'malo') {
    // En día malo SIEMPRE bajamos (mínimo 1). Sin culpa.
    return Math.max(1, base - 1)
  }
  if (estadoHoy === 'bueno') {
    // Subimos de forma gradual (máximo 3).
    return Math.min(3, base + 1)
  }
  // Día normal: mantenemos.
  return base
}

export function mensajeNivel(nivel, estadoHoy) {
  if (estadoHoy === 'malo')
    return 'Hoy vamos suave. Bajar la intensidad no es retroceder: es exactamente cómo se entrena. Cero culpa.'
  if (estadoHoy === 'bueno')
    return 'Te sientes con algo más de margen, así que subimos un poquito la exposición. Si en algún punto es demasiado, baja sin problema.'
  return 'Mantenemos un ritmo cómodo hoy. Tú marcas el paso.'
}
