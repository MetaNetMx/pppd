# CLAUDE.md — contexto del proyecto para IAs (léeme primero)

> Propósito de este archivo: que cualquier IA (o persona) entienda el proyecto **sin tener que leer
> todo el código**. Si algo de aquí contradice al código, gana el código — pero empieza por aquí.

## Qué es

**Ruta Calma**: PWA instalable de **autocuidado para PPPD** (mareo postural-perceptual persistente),
en **es-MX**. Apoyo complementario, **no** tratamiento médico. La construye una persona que tiene PPPD
(psicólogo). Tono: directo, cálido, sin prisa, sin autoayuda masiva. Lema: "Lo que eres no necesita
arreglarse."

## Reglas duras (NO romper nunca)

- **No diagnosticar, no prescribir, no prometer cura.** No recomendar fármacos ni dosis.
- **Derivar en crisis** (ideas de daño, deterioro, síntomas neurológicos nuevos). Nunca afrontamientos
  con dolor/malestar físico.
- **No reforzar miedo ni rumiación.** Síntomas = reales pero **no peligrosos**; el patrón se reentrena.
- **Sin claves embebidas en el cliente.** Van por proxy server-side o en IndexedDB local (con aviso).
- **Confort visual:** movimiento mínimo; escenas de navegación estáticas; respetar
  `prefers-reduced-motion`. El PPPD se agrava con estímulo visual en movimiento.
- **Toda técnica clínica** se rastrea en `src/lib/evidencia.js` y muestra etiqueta
  `[VALIDADO]`/`[ADYUVANTE]`/`[EMERGENTE]`. Fuente: `evidencia.md`.

## Stack

React 18 + Vite 6 + Tailwind 3 + vite-plugin-pwa. Estado: React local + **IndexedDB** (lib `idb`).
Sin router (navegación por estado en `App.jsx`). IA: API de Anthropic (modelo por defecto
`claude-sonnet-4-6`). TTS: capa configurable con respaldo a Web Speech. Deploy: Vercel con funciones
en `api/`. Sin TypeScript. Comentarios y UI en español.

## Comandos

```
npm install
npm run dev      # localhost:5173
npm run build    # dist/  (debe pasar limpio antes de commitear)
npm run preview
node scripts/generar-iconos.mjs   # regenera iconos PWA de marca
```

## Mapa del repo (dónde está cada cosa)

```
evidencia.md                 Base clínica con citas. Fuente de verdad de las etiquetas de evidencia.
PRD.md                       Requisitos de producto.
guiones-meditacion.md        Los 6 guiones (para grabar voz humana).
README.md                    Correr, conectar API/TTS, subir audios, desplegar en Vercel.
vercel.json                  Config de despliegue (framework vite + funciones api/).
.env.example                 Todas las variables (cliente VITE_* y servidor).
api/
  chat.js                    Función serverless → Anthropic (clave server-side).
  tts.js                     Función serverless → TTS (Azure es-MX | ElevenLabs | OpenAI).
scripts/generar-iconos.mjs   Generador de iconos PNG (sin deps).
src/
  App.jsx                    Shell, navegación por tabs, recordatorio, monta ErrorBoundary.
  lib/
    db.js                    IndexedDB (v2): perfil, diario, autoreportes, rutas, hallazgos,
                             config, audios (Blobs de voz humana por meditación).
    anthropic.js             Cliente chat (proxy o clave local; header de navegador directo).
    tts.js                   crearLocutor(): reproduce segmentos con TTS neuronal o navegador.
    evidencia.js             Registro de técnicas + niveles. ÚNICA fuente de etiquetas en la app.
    progreso.js              Cálculo de racha (sin culpa).
    informe.js               Informe imprimible (PDF vía window.print) para el especialista.
    util.js                  Fechas + helpers de voz del navegador.
  content/
    psicoeducacion.js        Textos del onboarding.
    meditaciones.js          6 guiones: segmentos {texto, pausa} + escena + técnica.
    ruta.js                  Pasos de la ruta + lógica adaptativa (decidirNivel).
    autoreporte.js           DHI/NPQ simplificados + puntuación.
    promptExplorador.js      Prompt de sistema del Explorador (reglas TCC duras) + JSON de respuesta.
    promptMeditacion.js      Prompt de sistema para meditación a la medida + enfoques.
  components/
    EtiquetaEvidencia.jsx    Chip de nivel de evidencia.
    Aviso.jsx                Banda de aviso/seguridad.
    NaturalezaScene.jsx      Escenas de naturaleza en SVG (estáticas en navegación).
    PatronVisual.jsx         Canvas para exposición visual graduada (parte de la VRT).
    GraficaLinea.jsx         Gráfica SVG minimalista (sin deps).
    ErrorBoundary.jsx        Captura errores de módulo sin tumbar la app.
  modules/
    Onboarding.jsx  RutaDiaria.jsx  Meditaciones.jsx  Explorador.jsx
    Seguimiento.jsx  PanelEvidencia.jsx  Ajustes.jsx  ModalCrisis.jsx
    ExposicionVisual.jsx   Práctica VRT graduada (4 niveles, patrones optocinéticos,
                           tolerancia antes/después, progresión). Se abre desde la pestaña Hoy.
```

## Cómo fluye lo importante

- **Datos:** todo en IndexedDB vía `src/lib/db.js`. No hay backend de datos. Exportar/borrar en Ajustes.
- **Explorador:** funciona SIEMPRE. Si hay IA conectada usa el chat con Anthropic
  (`src/lib/anthropic.js`, respuestas JSON); si no, usa el **modo guiado offline**
  (`src/content/exploradorOffline.js`): flujo TCC scripteado, una pregunta a la vez, con detección
  de crisis. La app es plenamente funcional sin configurar nada.
- **Meditación a la medida:** solo se muestra si hay IA conectada (si no, el usuario ve las 6
  grabadas, sin muros de configuración).
- **Ajustes simples:** lo técnico (API/proxy/TTS neuronal) vive bajo un `<details>` "Avanzado"; el
  usuario normal solo ve voz, recordatorio y datos.
- **Voz:** `src/lib/tts.js` `crearLocutor()` usa endpoint neuronal (`/api/tts` o configurado) y, si
  falla o no existe, cae a `speechSynthesis`. Respeta las pausas de cada segmento.
- **Ruta adaptativa:** `content/ruta.js` `decidirNivel(estado, nivelPrevio)` → nivel 1–3.
- **Evidencia:** edita `src/lib/evidencia.js` + `evidencia.md` juntos; la UI lee del registro.

## Convenciones

- Español en código, comentarios y UI. Colores de marca como utilidades Tailwind: `arena, salvia,
  jade, pino, bosque` (ver `tailwind.config.js`).
- Antes de dar por hecho un cambio: `npm run build` debe pasar.
- Al tocar contenido clínico, mantener las reglas duras de arriba y la trazabilidad a la evidencia.

## Estado y pendientes

Implementado: 6 módulos + onboarding, meditación a la medida, escenas SVG, TTS configurable, proxy
Vercel (chat+TTS), racha, informe PDF, recordatorio local, error boundary, iconos de marca.

Pendiente (depende del dueño): claves de API/TTS, grabar audios humanos, revisión clínica del copy,
validación del NPQ en español. Futuro técnico: Web Push (recordatorio con app cerrada), sync cifrada.
