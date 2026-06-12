// Manejadores de Web Push. Se inyecta en el service worker (vite-plugin-pwa → importScripts).
// Muestra el recordatorio cuando llega un push, aunque la app esté cerrada.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = {}
  }
  const title = data.title || 'Ruta Calma'
  const body = data.body || 'Tu ruta de hoy te espera, sin prisa. 🌿'
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'rc-recordatorio',
      lang: 'es-MX',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const w of wins) {
        if ('focus' in w) return w.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    })(),
  )
})
