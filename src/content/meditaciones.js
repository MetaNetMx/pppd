// Guiones de meditación guiada, es-MX. Tono directo, sin prisa, sin autoayuda masiva.
// Cada guion se puede: (a) leer en pantalla, (b) reproducir con TTS neuronal,
// (c) sustituir por un audio de voz humana subido por el usuario (campo audioUrl).
//
// Estructura de segmentos: { texto, pausa } donde `pausa` son segundos de silencio
// después de leer el texto (la guía respeta los silencios; el TTS los implementa con
// un temporizador entre fragmentos).
//
// Cada guion lleva su técnica de evidencia (ver lib/evidencia.js).

export const MEDITACIONES = [
  {
    id: 'aceptacion',
    escena: 'lago',
    titulo: 'Aceptar lo que está aquí',
    subtitulo: 'Dejar de pelear con el mareo',
    tecnica: 'mindfulness',
    duracionMin: 7,
    paisaje: 'niebla suave sobre un lago en calma',
    descripcion:
      'Una práctica para dejar de luchar contra las sensaciones. No se trata de que el mareo desaparezca, sino de hacerle espacio para que pese menos.',
    audioUrl: null,
    segmentos: [
      { texto: 'Acomódate como estés más cómodo. Sentado, recostado, da igual. No necesitas quedarte quieto del todo.', pausa: 4 },
      { texto: 'Si quieres, deja los ojos entreabiertos. Aquí no hay que cerrar nada a la fuerza.', pausa: 4 },
      { texto: 'Vamos a empezar solo notando que estás aquí. El peso de tu cuerpo sobre lo que te sostiene.', pausa: 6 },
      { texto: 'Quizá ahora mismo hay mareo, o inestabilidad, o una sensación rara de fondo. Está bien. No vamos a discutir con eso.', pausa: 6 },
      { texto: 'En lugar de empujarlo lejos, prueba a hacerle un poco de espacio. Como quien deja pasar a alguien por una puerta.', pausa: 7 },
      { texto: 'Recuerda: esta sensación es real, y no es peligrosa. Es una falsa alarma de un sistema que aprendió a estar en guardia.', pausa: 6 },
      { texto: 'No tienes que creerlo con fuerza. Solo ábrete a la posibilidad: estoy a salvo, aunque me sienta así.', pausa: 7 },
      { texto: 'Si tu mente se va a pelear con la sensación, o a buscar cómo arreglarla, está bien. Es lo que hace la mente. Solo regresa, sin regañarte.', pausa: 7 },
      { texto: 'Imagina que el mareo es como el clima. No lo elegiste, no lo controlas, y tampoco tienes que combatirlo. Solo lo dejas estar mientras sigues con tu día.', pausa: 8 },
      { texto: 'Respira sin forzar. El aire entra, el aire sale. Tú no tienes que sostener nada.', pausa: 7 },
      { texto: 'Antes de terminar, date las gracias por quedarte aquí, contigo, aunque sea incómodo.', pausa: 5 },
      { texto: 'Cuando quieras, vuelve poco a poco a la habitación. No hay prisa.', pausa: 3 },
    ],
  },
  {
    id: 'respiracion',
    escena: 'olas',
    titulo: 'Bajar la guardia',
    subtitulo: 'Respiración para la hipervigilancia',
    tecnica: 'respiracion',
    duracionMin: 6,
    paisaje: 'olas lentas llegando a una orilla',
    descripcion:
      'Una respiración pausada para calmar la alerta del cuerpo y soltar la vigilancia constante sobre el equilibrio.',
    audioUrl: null,
    segmentos: [
      { texto: 'Vamos a calmar la alarma del cuerpo. No respirando más, sino respirando más despacio.', pausa: 4 },
      { texto: 'Suelta los hombros. Afloja la mandíbula. Quizá no notabas que las apretabas.', pausa: 5 },
      { texto: 'Vamos a alargar la salida del aire, porque eso es lo que le dice a tu cuerpo que puede bajar la guardia.', pausa: 5 },
      { texto: 'Toma aire por la nariz, contando hasta cuatro. Uno… dos… tres… cuatro.', pausa: 4 },
      { texto: 'Y suéltalo despacio, contando hasta seis. Uno… dos… tres… cuatro… cinco… seis.', pausa: 6 },
      { texto: 'Otra vez. Entra en cuatro.', pausa: 4 },
      { texto: 'Sale en seis, sin forzar.', pausa: 6 },
      { texto: 'Si te marea contar, déjalo. Solo haz la salida un poco más larga que la entrada. Eso basta.', pausa: 6 },
      { texto: 'Mientras respiras, nota que no tienes que vigilar tu equilibrio. Tu cuerpo sabe sostenerse solo, aunque tú no lo supervises.', pausa: 7 },
      { texto: 'Cada salida de aire es un permiso para soltar un poco más. No hay nada que controlar en este momento.', pausa: 7 },
      { texto: 'Unas respiraciones más, a tu ritmo. Entra suave… y sale largo.', pausa: 8 },
      { texto: 'Cuando termines, lleva esa salida larga contigo. La puedes usar en cualquier momento del día.', pausa: 3 },
    ],
  },
  {
    id: 'bodyscan',
    escena: 'bosque',
    titulo: 'Recorrido amable del cuerpo',
    subtitulo: 'Body scan adaptado a la inestabilidad',
    tecnica: 'mindfulness',
    duracionMin: 9,
    paisaje: 'bosque de pinos con luz entrando entre las ramas',
    descripcion:
      'Un recorrido por el cuerpo pensado para quien se marea: en vez de buscar el balanceo, llevamos la atención a zonas neutras y firmes.',
    audioUrl: null,
    segmentos: [
      { texto: 'Este recorrido es distinto. No vamos a buscar el mareo ni a vigilar cómo te balanceas. Vamos a visitar zonas tranquilas del cuerpo.', pausa: 5 },
      { texto: 'Empecemos por lo que te sostiene. Los pies, o la espalda, o lo que toque la superficie debajo de ti. Nota ese contacto firme.', pausa: 7 },
      { texto: 'Lleva la atención a las plantas de los pies. Su peso, su temperatura. Tierra firme debajo.', pausa: 7 },
      { texto: 'Sube a las piernas. No tienen que hacer nada. Solo nótalas, pesadas y tranquilas.', pausa: 7 },
      { texto: 'Las manos. Quizá puedes mover un poco los dedos. Siente las palmas, su textura. Las manos son un buen lugar para anclarse.', pausa: 7 },
      { texto: 'Si en algún momento la cabeza pide atención y aparece el mareo, no pasa nada. Salúdalo y vuelve a las manos o a los pies. No lo persigas.', pausa: 8 },
      { texto: 'Los brazos, los hombros. Déjalos caer un poco más. No hay que sostener tensión aquí.', pausa: 7 },
      { texto: 'El pecho, subiendo y bajando con la respiración, sin que tú lo dirijas.', pausa: 7 },
      { texto: 'Y ahora todo el cuerpo a la vez, como un solo peso tranquilo apoyado, sostenido, completo.', pausa: 7 },
      { texto: 'Nada de tu cuerpo necesita arreglarse en este momento. Está haciendo su trabajo, incluso el sistema que se marea está intentando cuidarte.', pausa: 8 },
      { texto: 'Quédate aquí unos segundos más, apoyado y entero.', pausa: 6 },
      { texto: 'Cuando quieras, mueve un poco las manos y los pies, y regresa.', pausa: 3 },
    ],
  },
  {
    id: 'exposicion-visual',
    escena: 'campo',
    titulo: 'Mirar sin huir',
    subtitulo: 'Exposición visual suave',
    tecnica: 'vrt',
    duracionMin: 6,
    paisaje: 'campo de hierba moviéndose despacio con el viento',
    descripcion:
      'Una práctica muy suave para reencontrarte con el movimiento visual sin pelearlo. Empieza con poco; si es demasiado, cierra los ojos y respira.',
    audioUrl: null,
    nota: 'Si en algún punto el malestar sube mucho, detente, cierra los ojos y respira. Bajar la intensidad no es retroceder: es cómo se entrena.',
    segmentos: [
      { texto: 'Vamos a hacer algo delicado: estar con el movimiento visual sin salir corriendo. Tú marcas el ritmo, y puedes parar cuando quieras.', pausa: 5 },
      { texto: 'Para empezar, mira un punto fijo frente a ti. Una esquina, una mancha en la pared, lo que sea. Solo míralo, tranquilo.', pausa: 7 },
      { texto: 'Ahora, sin mover la cabeza, deja que tus ojos paseen muy despacio hacia un lado, y regresen al punto.', pausa: 7 },
      { texto: 'Hacia el otro lado, despacio, y de vuelta. Si aparece algo de mareo, es esperado. No es daño; es el sistema reaprendiendo.', pausa: 8 },
      { texto: 'Si te sientes bien, gira la cabeza muy lentamente de lado a lado, manteniendo la mirada en el punto fijo. Suave, pequeño.', pausa: 8 },
      { texto: 'Recuerda: estás entrenando a tu cerebro a tolerar el movimiento visual. Cada vez que te quedas un poco, en vez de huir, le enseñas que está a salvo.', pausa: 8 },
      { texto: 'Si fue suficiente, cierra los ojos y descansa. Si quieres seguir, repite el giro lento una o dos veces más.', pausa: 8 },
      { texto: 'Termina cerrando los ojos. Respira largo. Nota que sigues aquí, entero, después del movimiento.', pausa: 6 },
      { texto: 'Eso fue exposición, hecha con cuidado. Mañana, un poquito más. Sin prisa.', pausa: 3 },
    ],
  },
  {
    id: 'cierre-nocturno',
    escena: 'noche',
    titulo: 'Soltar el día',
    subtitulo: 'Cierre nocturno',
    tecnica: 'mindfulness',
    duracionMin: 8,
    paisaje: 'cielo nocturno despejado sobre montañas',
    descripcion:
      'Para terminar el día sin rumiar lo que costó. Un cierre amable que separa lo vivido del descanso.',
    audioUrl: null,
    segmentos: [
      { texto: 'El día terminó. Hayas hecho mucho o poco, hayas tenido un buen día o uno difícil, ya pasó. Ahora toca descansar.', pausa: 6 },
      { texto: 'Acomódate para dormir o para reposar. Deja que la superficie te sostenga por completo.', pausa: 6 },
      { texto: 'Si hoy el mareo fue fuerte, no lo cargues a la cama. No tienes que resolverlo esta noche. Mañana es otra oportunidad, sin culpa.', pausa: 7 },
      { texto: 'Si hubo un momento bueno, por pequeño que sea, tráelo a la mente. Un instante en que estuviste un poco mejor. Quédate ahí.', pausa: 8 },
      { texto: 'Vamos a soltar la vigilancia del día. Suelta la mandíbula, suelta la frente, suelta los hombros.', pausa: 7 },
      { texto: 'Respira despacio, alargando la salida del aire. Cada exhalación deja ir un poco del esfuerzo de hoy.', pausa: 8 },
      { texto: 'Tu cuerpo no tiene que estar en guardia para dormir. Puede descansar aunque las sensaciones sigan ahí de fondo.', pausa: 8 },
      { texto: 'No hay nada que arreglar antes de dormir. Lo que eres no necesita arreglarse. Solo descansar.', pausa: 8 },
      { texto: 'Deja que la respiración se haga lenta y suave, como olas que se alejan.', pausa: 9 },
      { texto: 'Que descanses. Aquí estaré mañana.', pausa: 3 },
    ],
  },
  {
    id: 'anclaje-rapido',
    escena: 'piedra',
    titulo: 'Ancla de un minuto',
    subtitulo: 'Para un momento difícil',
    tecnica: 'respiracion',
    duracionMin: 2,
    paisaje: 'piedra firme junto a un arroyo',
    descripcion:
      'Cuando el mareo o la angustia suben de golpe. Un anclaje corto para volver al presente sin pelear con la sensación.',
    audioUrl: null,
    nota: 'Si sientes que estás en crisis o en peligro, esto no sustituye pedir ayuda. Busca a alguien de confianza o atención profesional.',
    segmentos: [
      { texto: 'Si el mareo o la angustia subieron de golpe: estás a salvo. Esto es intenso, pero no peligroso. Va a bajar.', pausa: 4 },
      { texto: 'Apoya bien los pies en el suelo, o las manos en algo firme. Siente esa firmeza.', pausa: 5 },
      { texto: 'Nombra, en silencio o en voz baja, tres cosas que ves a tu alrededor.', pausa: 6 },
      { texto: 'Ahora dos cosas que puedes oír.', pausa: 5 },
      { texto: 'Y una cosa que puedes tocar. Nota su textura.', pausa: 5 },
      { texto: 'Respira: entra suave, y sale largo. Una vez más, sale largo.', pausa: 6 },
      { texto: 'No tienes que hacer que la sensación desaparezca. Solo quédate, respira, y deja que pase como pasa una ola.', pausa: 6 },
      { texto: 'Estás aquí. Estás a salvo. Ya hiciste lo necesario.', pausa: 3 },
    ],
  },
]

export function meditacion(id) {
  return MEDITACIONES.find((m) => m.id === id)
}
