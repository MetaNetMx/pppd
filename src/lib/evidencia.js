// Registro central de evidencia. Cada técnica que aparece en la app se rastrea aquí
// y muestra su etiqueta. Fuente: evidencia.md (búsqueda verificada, jun 2026).

export const NIVELES = {
  VALIDADO: {
    id: 'VALIDADO',
    texto: 'VALIDADO',
    descripcion: 'Primera línea con respaldo en consenso y revisiones sistemáticas.',
    color: 'bg-pino text-arena',
  },
  ADYUVANTE: {
    id: 'ADYUVANTE',
    texto: 'ADYUVANTE',
    descripcion: 'Evidencia parcial o indirecta. Apoyo, no tratamiento independiente.',
    color: 'bg-jade/20 text-pino',
  },
  EMERGENTE: {
    id: 'EMERGENTE',
    texto: 'EMERGENTE',
    descripcion: 'Prometedor pero no estándar. Hipótesis, no probado.',
    color: 'bg-salvia/30 text-bosque',
  },
}

export const TECNICAS = [
  {
    id: 'vrt',
    nombre: 'Rehabilitación vestibular',
    nivel: 'VALIDADO',
    porque:
      'Reentrena al cerebro para volver a confiar en las señales de equilibrio y reduce la dependencia visual, con exposición graduada.',
    detalle:
      'Habituación, estabilización de la mirada y desensibilización visual. Metaanálisis 2025: mejora del DHI ≈21.8 puntos; añadir VRT a un ISRS supera al ISRS solo. La dosis se sube despacio para no provocar brotes.',
    certeza: 'Certeza GRADE moderada–baja.',
  },
  {
    id: 'tcc',
    nombre: 'Terapia cognitivo-conductual (TCC)',
    nivel: 'VALIDADO',
    porque:
      'Cambia la interpretación amenazante del mareo y reduce la evitación, que es lo que mantiene el círculo vicioso.',
    detalle:
      'Reencuadre de síntomas como no peligrosos, reducción de conductas de evitación y de seguridad, manejo de la hipervigilancia. Funciona especialmente combinada con la rehabilitación vestibular.',
    certeza: 'Primera línea por consenso; base de ensayos aún limitada.',
  },
  {
    id: 'isrs',
    nombre: 'ISRS / IRSN (medicación)',
    nivel: 'VALIDADO',
    porque:
      'Pueden modular las redes cerebrales de amenaza implicadas en el PPPD; es decisión y seguimiento de tu médico.',
    detalle:
      'ISRS + terapia conservadora supera al ISRS solo (DHI ≈8.4, ansiedad HAMA ≈3.6). ~36% no responde o no tolera. La app NO prescribe ni recomienda fármacos: solo informa y deriva al médico.',
    certeza: 'Certeza GRADE baja–muy baja. Requiere prescripción médica.',
  },
  {
    id: 'mindfulness',
    nombre: 'Mindfulness y aceptación (ACT)',
    nivel: 'ADYUVANTE',
    porque:
      'Aceptar las sensaciones en vez de luchar contra ellas baja la hipervigilancia que alimenta el mareo.',
    detalle:
      'Integrada con la TCC en modelos recientes del PPPD y respaldada por un reporte de caso de terapia Morita (2025). Evidencia directa limitada; respaldo mayor en dolor crónico y ansiedad.',
    certeza: 'Evidencia parcial, sobre todo indirecta.',
  },
  {
    id: 'respiracion',
    nombre: 'Respiración y grounding',
    nivel: 'ADYUVANTE',
    porque: 'Calma la activación de amenaza que amplifica el mareo y reancla la atención.',
    detalle:
      'Sin ensayos que la aíslen como tratamiento. Regula la ansiedad, que según la evidencia de 2025 empeora la respuesta a la rehabilitación vestibular. Herramienta de apoyo, no cura.',
    certeza: 'Evidencia indirecta.',
  },
  {
    id: 'hipervigilancia',
    nombre: 'Regulación de hipervigilancia / activación conductual',
    nivel: 'ADYUVANTE',
    porque: 'Recuperar actividad y redirigir la atención rompe el ciclo de evitación e hipervigilancia.',
    detalle:
      'La hipervigilancia es un mediador identificado de los síntomas (estudio 2024). Retomar actividades evitadas de forma graduada sigue el mismo principio que la exposición.',
    certeza: 'Mediador identificado; evidencia directa escasa.',
  },
  {
    id: 'rv',
    nombre: 'Realidad virtual para exposición',
    nivel: 'EMERGENTE',
    porque: 'Puede servir como vehículo de la desensibilización visual, no como tratamiento aparte.',
    detalle:
      'En los metaanálisis la VRT personalizada superó a la RV sola. La app sustituye la RV inmersiva por vídeo/imágenes de intensidad graduable, como soporte de la VRT validada. Hipótesis de implementación, no eficacia probada.',
    certeza: 'No estándar como técnica independiente.',
  },
  {
    id: 'rtms',
    nombre: 'rTMS (estimulación magnética)',
    nivel: 'EMERGENTE',
    porque: 'Neuromodulación prometedora en otros cuadros; en PPPD la evidencia es preliminar.',
    detalle:
      'Requiere equipo y supervisión médica. La app solo la menciona de forma informativa; no se implementa.',
    certeza: 'Preliminar en PPPD.',
  },
  {
    id: 'tdcs',
    nombre: 'tDCS (corriente directa transcraneal)',
    nivel: 'EMERGENTE',
    porque: 'Aparece en revisiones, pero su certeza de efecto es poco clara por escasez de estudios.',
    detalle:
      'Investigada como potenciador de la exposición, con resultados mixtos. Requiere supervisión profesional. La app solo la menciona; no se implementa.',
    certeza: 'Certeza poco clara.',
  },
]

export function tecnica(id) {
  return TECNICAS.find((t) => t.id === id)
}
