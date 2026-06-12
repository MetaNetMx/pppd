# Ruta Calma — PWA de autoayuda para PPPD

> *"Lo que eres no necesita arreglarse."*

PWA instalable de **apoyo y autocuidado** para el **mareo postural-perceptual persistente (PPPD)**,
en español de México. Combina psicoeducación, una ruta diaria adaptativa de reentrenamiento,
meditaciones guiadas, un explorador conversacional informado por TCC, y seguimiento de síntomas.

✅ **Funciona para cualquiera sin configurar nada.** Al abrirla, todos los módulos funcionan en
local: psicoeducación, ruta diaria, meditaciones (con voz del navegador o leyendo el guion),
explorador (modo guiado offline), seguimiento, evidencia y crisis. Conectar la IA y la voz neuronal
es **opcional** y solo enriquece el explorador y las meditaciones a la medida.

⚠️ **No es tratamiento médico.** Es un complemento de la atención profesional. No diagnostica, no
prescribe y no sustituye a tu médico ni a un especialista vestibular. La base clínica está en
[`evidencia.md`](./evidencia.md), con cada técnica etiquetada `[VALIDADO]`, `[ADYUVANTE]` o
`[EMERGENTE]`.

---

## Qué incluye

| Módulo | Qué hace |
|---|---|
| **1. Onboarding / psicoeducación** | Explica el PPPD en lenguaje sencillo (dependencia visual, hipervigilancia). Mensaje central: síntomas reales pero no peligrosos; el patrón se reentrena. |
| **2. Ruta de alivio diaria** | Secuencia < 10 min: respiración, estabilización de la mirada, exposición visual graduada, aceptación y un reto conductual. **Adaptativa**: baja en días malos, sube tras avances, sin culpa. |
| **3. Meditaciones** | 6 guiones con reproductor: voz humana (subes tus audios) + voz sintética (TTS) de respaldo. Además, **"Meditación a la medida"**: genera con la IA una meditación personalizada según cómo te sientes en el momento (mismas reglas de seguridad; deriva ante crisis). |
| **4. Explorador del detonante** | Diálogo guiado, una pregunta a la vez, informado por TCC. **Funciona sin configurar nada** (modo guiado offline); si conectas la IA, la conversación se vuelve más libre y adaptativa. Guarda hallazgos en memoria local. |
| **5. Seguimiento** | Diario de síntomas + autorreporte DHI/NPQ simplificado + gráficas de evolución. |
| **6. Panel de evidencia** | Cada técnica con su nivel de evidencia y un "por qué" en una frase. |

Extras: manejo básico de **crisis** (botón "Momento difícil"), **ajustes** con exportar/borrar datos,
e instalación como app (PWA con uso offline del shell).

---

## Stack

- **React 18 + Vite 6 + Tailwind CSS 3**
- **IndexedDB** (vía `idb`) para todo el almacenamiento local — sin backend obligatorio
- **vite-plugin-pwa** (manifest + service worker, instalable y offline)
- **API de Anthropic** para el módulo conversacional (sin clave embebida)

---

## Cómo correrla

Requisitos: **Node.js 18+** (probado en Node 24).

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # genera dist/ (producción)
npm run preview   # sirve dist/ localmente para probar la PWA instalable
```

Para **instalarla** como app: abre la versión `build`/`preview` (o desplegada) en Chrome/Edge/Safari
y usa "Instalar app" / "Agregar a pantalla de inicio". Funciona en escritorio y móvil.

### Iconos de la PWA

Hay iconos de marcador de posición (tile color pino) generados por script:

```bash
node scripts/generar-iconos.mjs
```

Reemplaza los archivos en `public/icons/` por arte definitivo cuando lo tengas (mismos nombres y
tamaños: `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`).

---

## Conectar la IA (módulo Explorador)

La clave **nunca está embebida en el código**. Hay dos formas de conectar, en orden de preferencia:

### Opción A — Proxy propio (recomendada para distribución)
Si vas a compartir la app con otras personas, **no expongas tu clave en el navegador**. Levanta un
pequeño proxy que guarde la clave en el servidor y reenvíe a la API de Anthropic.

1. Crea un endpoint (Vercel Function, Cloudflare Worker, Express, etc.) que reciba el cuerpo
   `{ model, max_tokens, temperature, system, messages }`, le agregue el header `x-api-key` con tu
   clave (desde una variable de entorno del servidor) y `anthropic-version: 2023-06-01`, llame a
   `https://api.anthropic.com/v1/messages` y devuelva el JSON de respuesta tal cual.
2. En la app: **Ajustes (⚙︎) → URL de proxy** → pega la URL del endpoint. Listo.

Ejemplo mínimo (Vercel Function, `api/chat.js`):

```js
export default async function handler(req, res) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,   // <- clave en el servidor
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  })
  res.status(r.status).json(await r.json())
}
```

### Opción B — Clave local en el dispositivo (uso personal)
Para tu propio uso, sin servidor:

- **Ajustes (⚙︎) → Clave de API de Anthropic** → pega tu `sk-ant-...`.
- Se guarda **solo en este dispositivo** (IndexedDB) y la llamada va directa a Anthropic desde el
  navegador (con el header `anthropic-dangerous-direct-browser-access`).
- ⚠️ Cualquiera con acceso a este navegador/dispositivo podría leer la clave. No uses esta opción en
  equipos compartidos ni en una versión pública.

### Variables de entorno (alternativa al campo de Ajustes)
Puedes fijarlas al compilar creando un archivo `.env` (ver `.env.example`):

```
VITE_ANTHROPIC_API_KEY=sk-ant-...     # opción B, embebida en el build (úsalo solo para tu build privado)
VITE_API_PROXY_URL=https://...        # opción A, URL del proxy
```

### Modelo
Por defecto usa `claude-sonnet-4-6`. Cámbialo en **Ajustes → Modelo** (p. ej. otro modelo Claude que
prefieras). El módulo Explorador tiene reglas duras en su prompt de sistema: no diagnostica, no
promete cura, no recomienda fármacos y deriva ante señales de crisis.

---

## Subir tus propios audios de meditación

Cada meditación tiene voz sintética de respaldo, pero puedes (y conviene) usar **tu voz**:

1. Abre **Meditar → elige una meditación**.
2. Graba el guion correspondiente (están en [`guiones-meditacion.md`](./guiones-meditacion.md),
   con las pausas marcadas). Formatos: `.mp3`, `.m4a`, `.wav`.
3. En el reproductor, sección **"Sube tu propia voz"**, elige el archivo.
4. Se guarda **solo en este dispositivo** (IndexedDB) y reemplaza a la voz sintética para esa
   meditación. El reproductor de audio aparece arriba.

> Nota técnica: los audios se guardan como data URL en IndexedDB. Para bibliotecas grandes de audio,
> considera migrar a `Blob` + `URL.createObjectURL` o a la Cache API; el código está aislado en
> `src/modules/Meditaciones.jsx` (función `subirAudio`).

### Voz sintética (TTS)
Hay dos motores, con respaldo automático:

1. **Voz neuronal es-MX (recomendada).** En **Ajustes → Voz neuronal** pones la **URL de un endpoint
   de TTS**, opcionalmente un id de voz y un token. La app la usa para todas las meditaciones (las
   grabadas y las "a la medida"), respetando las pausas de cada guion. Si una frase falla, cae
   sola a la voz del navegador.
2. **Voz del navegador (respaldo).** Web Speech API. En **Ajustes → Voz del navegador** eliges una
   voz en español; se prioriza `es-MX` si existe.

**Contrato del endpoint de TTS** (para conectar el proveedor que quieras vía proxy, sin exponer su
clave en el cliente):

```
POST <URL configurada>
headers: content-type: application/json
         authorization: Bearer <token>   (solo si configuras token en Ajustes)
body:    { "text": "<frase a sintetizar>", "voice": "<id de voz opcional>", "lang": "es-MX" }
respuesta: bytes de audio (audio/mpeg, audio/wav, …) — la app los reproduce directamente
```

Ejemplo de proxy (Vercel Function, `api/tts.js`) apuntando a un proveedor neuronal:

```js
export default async function handler(req, res) {
  const { text, voice } = req.body
  const r = await fetch('https://api.tu-proveedor-tts.com/v1/synthesize', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.TTS_KEY}` },
    body: JSON.stringify({ text, voice: voice || 'es-MX-Dalia', format: 'mp3' }),
  })
  res.setHeader('content-type', 'audio/mpeg')
  res.send(Buffer.from(await r.arrayBuffer()))
}
```

La lógica de reproducción (neuronal + respaldo, con silencios entre segmentos) está en
`src/lib/tts.js` (`crearLocutor`).

### Estética: escenas de naturaleza
Cada meditación tiene una **escena de naturaleza en SVG** bundleada (lago, olas, bosque, campo,
noche, piedra) — sin imágenes externas ni problemas de licencia, y funciona offline. Las
meditaciones "a la medida" eligen escena según el paisaje que genera la IA. El movimiento es muy
lento y se detiene con `prefers-reduced-motion` (importante en PPPD). Código en
`src/components/NaturalezaScene.jsx`; para usar fotos reales, reemplaza ese componente.

---

## Desplegar en Vercel (proxy de API + TTS incluido)

El repo trae funciones serverless en `api/` para no exponer ninguna clave en el navegador:
`api/chat.js` (Anthropic) y `api/tts.js` (TTS neuronal, soporta **Azure es-MX**, ElevenLabs y OpenAI).

1. Sube el repo a GitHub e impórtalo en Vercel (framework detectado: **Vite**; ya hay `vercel.json`).
2. En **Project Settings → Environment Variables** agrega:
   - **Cliente** (build): `VITE_API_PROXY_URL=/api/chat`, `VITE_TTS_ENDPOINT=/api/tts`,
     `VITE_TTS_VOICE=es-MX-DaliaNeural`.
   - **Servidor** (chat): `ANTHROPIC_API_KEY=sk-ant-...`.
   - **Servidor** (TTS, elige proveedor con `TTS_PROVIDER`):
     - `azure` (recomendado, es-MX real): `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` (ej. `eastus`).
     - `elevenlabs`: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`.
     - `openai`: `OPENAI_API_KEY`.
3. **Deploy.** Listo: la app instalable queda en tu dominio, el Explorador y las meditaciones a la
   medida usan `/api/chat`, y las voces usan `/api/tts`. Sin claves en el cliente.

Con esta configuración, los campos de clave en *Ajustes* quedan opcionales (puedes dejarlos vacíos).
Ver todas las variables en [`.env.example`](./.env.example).

## Privacidad

- Todo (diario, autorreportes, memoria del explorador, ajustes, audios) vive en **IndexedDB**, en tu
  dispositivo. No hay backend que recoja datos.
- Lo único que sale del dispositivo son los mensajes que tú escribes en el **Explorador**, que se
  envían a la API de Anthropic (o a tu proxy) para generar la respuesta.
- En **Ajustes** puedes **Exportar** tus datos a un JSON o **Borrar todo**.

---

## Estructura del proyecto

```
pppd/
├── evidencia.md                # Mapa de evidencia (fuente clínica, con citas)
├── guiones-meditacion.md       # Los 6 guiones para grabar
├── README.md
├── scripts/generar-iconos.mjs  # Genera iconos PWA
├── public/
│   ├── favicon.svg
│   └── icons/                  # icon-192/512/maskable.png
└── src/
    ├── App.jsx                 # Shell + navegación + crisis/ajustes
    ├── lib/
    │   ├── db.js               # IndexedDB (diario, reportes, memoria, config)
    │   ├── anthropic.js        # Cliente API (key local o proxy, sin embeber)
    │   ├── evidencia.js        # Registro central de técnicas + niveles
    │   └── util.js             # Fechas + TTS es-MX
    ├── content/
    │   ├── psicoeducacion.js   # Textos de onboarding
    │   ├── meditaciones.js     # Guiones (segmentos + pausas)
    │   ├── ruta.js             # Pasos de la ruta + lógica adaptativa
    │   ├── autoreporte.js      # DHI/NPQ simplificados
    │   └── promptExplorador.js # Prompt de sistema (reglas duras TCC)
    ├── components/             # EtiquetaEvidencia, Aviso, PatronVisual, GraficaLinea
    └── modules/                # Los 6 módulos + Onboarding, Ajustes, ModalCrisis
```

---

## Roadmap sugerido (siguientes iteraciones)

- Recordatorios locales (notificaciones) para la ruta diaria.
- Sincronización opcional cifrada entre dispositivos (hoy es 100% local).
- TTS neuronal externo es-MX como respaldo de mayor calidad.
- Progresión de exposición visual más fina (más niveles, patrones alternativos).
- Validación de la versión española del NPQ con un profesional.

---

## Aviso final

Ruta Calma es una herramienta de autocuidado. Si no tienes un diagnóstico confirmado de PPPD, si tus
síntomas cambian, o si aparecen señales nuevas, **consulta a un especialista vestibular y a tu
médico**. Ante una crisis, busca ayuda profesional o servicios de emergencia.
