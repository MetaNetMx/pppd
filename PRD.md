# PRD — Ruta Calma (PWA de autoayuda para PPPD)

**Versión:** 0.1 · **Fecha:** junio 2026 · **Idioma de producto:** español (es-MX)
**Lema:** *"Lo que eres no necesita arreglarse."*

---

## 1. Resumen

Ruta Calma es una **PWA instalable** de **apoyo y autocuidado** para personas con **PPPD** (mareo
postural-perceptual persistente). Combina psicoeducación, una ruta diaria adaptativa de
reentrenamiento, meditaciones guiadas (voz humana o TTS neuronal es-MX), un explorador conversacional
informado por TCC (API de Anthropic), y seguimiento de síntomas con escalas simplificadas.

**No es un dispositivo médico ni tratamiento.** Es complemento de la atención profesional. No
diagnostica, no prescribe, no promete cura y deriva ante señales de crisis.

## 2. Problema y oportunidad

El PPPD es una causa frecuente de mareo crónico, **funcional** (no estructural): síntomas reales pero
no peligrosos, sostenidos por dependencia visual, hipervigilancia, control postural rígido y un fallo
de readaptación. El tratamiento de primera línea (rehabilitación vestibular, TCC, a veces ISRS) tiene
respaldo pero **poca disponibilidad y poco material en español**. Hay un hueco para una herramienta de
autocuidado, en es-MX, que traduzca la evidencia en práctica diaria y reduzca el miedo y la evitación.

## 3. Usuario objetivo

- Persona hispanohablante (es-MX) con PPPD diagnosticado o en estudio.
- Busca entender su condición, reducir síntomas y recuperar actividad, entre consultas.
- Sensible al movimiento visual (la UI debe minimizar movimiento y dar control).

## 4. Principios de diseño

1. **Síntomas reales, no peligrosos; el patrón se reentrena.** Mensaje transversal.
2. **Transparencia de evidencia.** Cada técnica etiquetada `[VALIDADO]`/`[ADYUVANTE]`/`[EMERGENTE]`.
3. **Sin culpa.** La ruta baja de intensidad en días malos; saltarse un día no penaliza.
4. **Calma visual.** Paleta natural, movimiento mínimo, respeto a `prefers-reduced-motion`.
5. **Privacidad primero.** Todo local (IndexedDB); sin backend obligatorio; exportar/borrar datos.
6. **Seguridad clínica no negociable.** No diagnóstico/prescripción; manejo de crisis con derivación.

## 5. Alcance — Módulos (todos implementados)

1. **Onboarding / psicoeducación** — mecanismo del PPPD en lenguaje simple, por pasos.
2. **Ruta de alivio diaria (<10 min, adaptativa)** — check-in → grounding → estabilización de mirada
   → exposición visual graduada → aceptación → reto conductual → cierre. Nivel 1–3 según el día.
3. **Meditaciones** — 6 guiones con reproductor (voz humana subida por el usuario + TTS neuronal/
   navegador) y **"meditación a la medida"** generada con la IA según el estado del usuario.
4. **Explorador del detonante** — diálogo TCC, una pregunta a la vez, refleja y reencuadra; guarda
   hallazgos en memoria local. Reglas duras de seguridad en el prompt de sistema.
5. **Seguimiento** — diario de síntomas + autorreporte DHI/NPQ simplificado + gráficas + racha +
   exportar informe PDF para el especialista.
6. **Panel de evidencia** — cada técnica con su nivel y un "por qué" en una frase.

Transversal: modal de crisis, ajustes (conexión IA/TTS, voz, recordatorio, exportar/borrar), PWA
instalable y offline.

## 6. Requisitos funcionales clave

- **RF1.** Almacenamiento local en IndexedDB para diario, autorreportes, rutas, hallazgos, config.
- **RF2.** La ruta diaria ajusta intensidad: día malo baja, día bueno sube (gradual), normal mantiene.
- **RF3.** El Explorador llama a la API de Anthropic vía proxy o clave local; nunca embebida por def.
- **RF4.** Las meditaciones reproducen segmentos con silencios; TTS neuronal con respaldo a navegador.
- **RF5.** Generación de meditación a la medida con esquema JSON validado y reglas de seguridad.
- **RF6.** Seguimiento grafica DHI (0–100), NPQ (0–36) y malestar (0–10); calcula racha.
- **RF7.** Exportar informe imprimible (PDF vía print) y exportar/borrar todos los datos.
- **RF8.** Recordatorio diario local (notificación al abrir la app si pasó la hora y falta la ruta).

## 7. Requisitos no funcionales

- **Seguridad clínica:** sin diagnóstico/prescripción; derivación en crisis; sin afrontamientos por
  dolor. Avisos médicos visibles.
- **Privacidad:** datos locales; lo único que sale del dispositivo son los mensajes del Explorador y
  el texto a sintetizar (hacia la API/proxy configurado).
- **Accesibilidad y confort visual:** movimiento reducido, contrastes suaves, tipografía legible.
- **Offline:** shell cacheado por service worker; funciona sin red salvo IA/TTS.
- **Sin secretos en el cliente:** claves en servidor (proxy `/api/*`) o, para uso personal, en
  IndexedDB del dispositivo (con advertencia).

## 8. Base de evidencia

Ver `evidencia.md` (fuentes verificadas, jun 2026: Bárány Society 2017 + revisiones sistemáticas y
metaanálisis 2025). Clasificación: VALIDADO (VRT, TCC, ISRS), ADYUVANTE (mindfulness/aceptación,
respiración, regulación de hipervigilancia), EMERGENTE (RV, rTMS, tDCS — no presentados como probados).

## 9. Marca

Paleta: arena `#F5EFE0`, salvia `#8A9E9A`, jade `#4E7E7A`, pino `#1E5050`, bosque `#163D3D`.
Tipografías: Cormorant Garamond (titulares) + Lato (cuerpo). Estética: naturaleza, minimalismo,
paleta natural. Voz: directa, sin prisa, sin autoayuda masiva.

## 10. Métricas de éxito (propuestas)

- Uso sostenido de la ruta diaria (racha, % de días activos).
- Tendencia a la baja en DHI/NPQ autorreportados a 8–12 semanas.
- Adherencia a la exposición visual (progresión de nivel sin abandono).
- Cualitativo: percepción de los síntomas como menos amenazantes.

## 11. Fuera de alcance (v0.1)

- Diagnóstico automatizado, recomendación de fármacos o dosis.
- Sincronización en la nube / multidispositivo.
- Recordatorios push con la app cerrada (requiere Web Push + servidor).
- Telemetría/analítica.

## 12. Roadmap

- **Hecho:** 6 módulos, evidencia, meditación a la medida, escenas de naturaleza, TTS configurable,
  proxy Vercel (chat + TTS), racha, informe PDF, recordatorio local, error boundary.
- **Hecho (cont.):** modo guiado offline del Explorador (funciona sin IA); UI simplificada
  (config técnica bajo "Avanzado"); **práctica de exposición visual** con 4 niveles, patrones
  optocinéticos (puntos/barras/tablero/ondas), valoración de tolerancia antes/después y progresión.
- **Siguiente:** Web Push para recordatorios con app cerrada; sincronización cifrada opcional;
  validación del NPQ-es; biblioteca de audios humanos.

## 13. Riesgos y mitigaciones

- **Sobre-confianza del usuario en la app** → avisos claros, derivación, panel de evidencia honesto.
- **Estímulo visual que dispara síntomas** → movimiento mínimo, escenas estáticas en navegación,
  control de intensidad y pausa inmediata en la exposición.
- **Exposición de claves** → proxy server-side recomendado; clave local solo con advertencia.
- **Contenido clínico impreciso** → trazabilidad a `evidencia.md`; revisión por profesional pendiente.
