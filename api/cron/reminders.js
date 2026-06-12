// Cron de recordatorios (lo invoca Vercel Cron, ver vercel.json). Cada hora revisa las
// suscripciones y envía el recordatorio a quienes les toca según SU hora local, una vez al día.
// Requiere VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (y opcional VAPID_SUBJECT) + KV configurado.

import webpush from 'web-push'
import { kvDisponible, kvGetJSON, kvSetJSON } from '../_kv.js'

const KEY = 'rc:subs'

export default async function handler(req, res) {
  if (!kvDisponible()) {
    res.status(200).json({ ok: false, motivo: 'kv-no-configurado' })
    return
  }
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) {
    res.status(500).json({ error: 'Faltan claves VAPID en el servidor.' })
    return
  }
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_SUBJECT || 'recordatorios@rutacalma.app'}`,
    pub,
    priv,
  )

  const subs = (await kvGetJSON(KEY, [])) || []
  const ahora = new Date()
  let enviados = 0
  const vivas = []

  for (const s of subs) {
    // Hora local del usuario = UTC - tzOffset(min). getTimezoneOffset da min para pasar de local a UTC.
    const local = new Date(ahora.getTime() - (s.tzOffset || 0) * 60000)
    const hoyLocal = local.toISOString().slice(0, 10)
    const [h] = String(s.hora || '09:00').split(':').map(Number)

    let conservar = true
    if (local.getUTCHours() === h && s.lastSent !== hoyLocal) {
      try {
        await webpush.sendNotification(
          s.subscription,
          JSON.stringify({
            title: 'Ruta Calma',
            body: 'Tu ruta de hoy te espera, sin prisa. 🌿',
          }),
        )
        s.lastSent = hoyLocal
        enviados++
      } catch (e) {
        // 404/410 = suscripción caducada: la quitamos.
        if (e?.statusCode === 404 || e?.statusCode === 410) conservar = false
      }
    }
    if (conservar) vivas.push(s)
  }

  await kvSetJSON(KEY, vivas)
  res.status(200).json({ ok: true, enviados, total: vivas.length })
}
