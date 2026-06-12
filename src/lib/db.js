import { openDB } from 'idb'

// Almacenamiento local en IndexedDB. Sin backend: todo vive en el dispositivo.
// Stores:
//  - perfil        : un único registro de ajustes/onboarding (key 'perfil')
//  - diario        : entradas de síntomas (autosincronizadas por fecha)
//  - autoreportes  : DHI/NPQ simplificados a lo largo del tiempo
//  - rutas         : registro de sesiones de la ruta diaria
//  - hallazgos     : memoria del Explorador del detonante
//  - config        : claves de configuración (API key, modelo, voz, etc.)

const DB_NAME = 'ruta-calma-pppd'
const DB_VERSION = 1

let dbPromise

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('perfil')) {
          db.createObjectStore('perfil')
        }
        if (!db.objectStoreNames.contains('diario')) {
          const s = db.createObjectStore('diario', { keyPath: 'id', autoIncrement: true })
          s.createIndex('fecha', 'fecha')
        }
        if (!db.objectStoreNames.contains('autoreportes')) {
          const s = db.createObjectStore('autoreportes', { keyPath: 'id', autoIncrement: true })
          s.createIndex('fecha', 'fecha')
        }
        if (!db.objectStoreNames.contains('rutas')) {
          const s = db.createObjectStore('rutas', { keyPath: 'id', autoIncrement: true })
          s.createIndex('fecha', 'fecha')
        }
        if (!db.objectStoreNames.contains('hallazgos')) {
          db.createObjectStore('hallazgos', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config')
        }
      },
    })
  }
  return dbPromise
}

// --- Perfil / onboarding ---
export async function getPerfil() {
  return (await getDB()).get('perfil', 'perfil')
}
export async function setPerfil(perfil) {
  return (await getDB()).put('perfil', perfil, 'perfil')
}

// --- Config (API key, modelo, preferencias de voz) ---
export async function getConfig(key, fallback = null) {
  const v = await (await getDB()).get('config', key)
  return v === undefined ? fallback : v
}
export async function setConfig(key, value) {
  return (await getDB()).put('config', value, key)
}

// --- Diario de síntomas ---
export async function addEntradaDiario(entrada) {
  return (await getDB()).add('diario', entrada)
}
export async function getDiario() {
  return (await getDB()).getAllFromIndex('diario', 'fecha')
}

// --- Autorreportes (DHI / NPQ simplificados) ---
export async function addAutoreporte(reporte) {
  return (await getDB()).add('autoreportes', reporte)
}
export async function getAutoreportes() {
  return (await getDB()).getAllFromIndex('autoreportes', 'fecha')
}

// --- Rutas diarias ---
export async function addRuta(registro) {
  return (await getDB()).add('rutas', registro)
}
export async function getRutas() {
  return (await getDB()).getAllFromIndex('rutas', 'fecha')
}

// --- Hallazgos del Explorador del detonante ---
export async function addHallazgo(h) {
  return (await getDB()).add('hallazgos', h)
}
export async function getHallazgos() {
  return (await getDB()).getAll('hallazgos')
}
export async function clearHallazgos() {
  return (await getDB()).clear('hallazgos')
}

// --- Exportar / borrar todo (privacidad) ---
export async function exportarTodo() {
  const db = await getDB()
  return {
    perfil: await db.get('perfil', 'perfil'),
    diario: await db.getAll('diario'),
    autoreportes: await db.getAll('autoreportes'),
    rutas: await db.getAll('rutas'),
    hallazgos: await db.getAll('hallazgos'),
    exportado: new Date().toISOString(),
  }
}
export async function borrarTodo() {
  const db = await getDB()
  await Promise.all([
    db.clear('perfil'),
    db.clear('diario'),
    db.clear('autoreportes'),
    db.clear('rutas'),
    db.clear('hallazgos'),
  ])
}
