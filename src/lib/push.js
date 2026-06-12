// Cliente de Web Push. Permite recibir el recordatorio diario con la app cerrada.
// Requiere VITE_VAPID_PUBLIC_KEY (clave pública VAPID) y el backend en /api/push.
// Si no está configurado, pushDisponible() es false y la app usa el recordatorio local.

const VAPID_PUBLIC = import.meta.env?.VITE_VAPID_PUBLIC_KEY || ''
const API = import.meta.env?.VITE_PUSH_API || '/api/push/subscribe'

export function pushDisponible() {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    Boolean(VAPID_PUBLIC)
  )
}

function base64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

// Suscribe e informa al servidor de la hora deseada y el huso horario.
export async function suscribirPush(hora) {
  if (!pushDisponible()) return { ok: false, motivo: 'no-soportado' }
  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') return { ok: false, motivo: 'sin-permiso' }

  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(VAPID_PUBLIC),
    })
  }
  const tzOffset = new Date().getTimezoneOffset() // minutos (UTC = local + offset)
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subscription: sub, hora, tzOffset }),
    })
    return { ok: res.ok, motivo: res.ok ? '' : 'servidor' }
  } catch {
    return { ok: false, motivo: 'red' }
  }
}

export async function desuscribirPush() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    try {
      await fetch(API, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
    } catch {
      /* ignorar */
    }
    await sub.unsubscribe()
  }
}
