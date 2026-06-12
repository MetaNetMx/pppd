// Registra o elimina una suscripción de Web Push para el recordatorio diario.
// POST  { subscription, hora:"HH:MM", tzOffset }  -> guarda/actualiza
// DELETE { endpoint }                              -> elimina
// Almacena en KV bajo la clave 'rc:subs' como arreglo JSON. Si no hay KV, no-op (200).

import { kvDisponible, kvGetJSON, kvSetJSON } from '../_kv.js'

const KEY = 'rc:subs'

export default async function handler(req, res) {
  if (!kvDisponible()) {
    // Sin almacén configurado: el push de fondo no está activo (se usará recordatorio local).
    res.status(200).json({ ok: false, motivo: 'kv-no-configurado' })
    return
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const subs = (await kvGetJSON(KEY, [])) || []

    if (req.method === 'DELETE') {
      const filtradas = subs.filter((s) => s.subscription?.endpoint !== body.endpoint)
      await kvSetJSON(KEY, filtradas)
      res.status(200).json({ ok: true })
      return
    }

    if (req.method === 'POST') {
      const { subscription, hora, tzOffset } = body
      if (!subscription?.endpoint) {
        res.status(400).json({ error: 'Falta subscription.' })
        return
      }
      const sinEsta = subs.filter((s) => s.subscription?.endpoint !== subscription.endpoint)
      sinEsta.push({
        subscription,
        hora: hora || '09:00',
        tzOffset: Number(tzOffset) || 0,
        lastSent: null,
      })
      await kvSetJSON(KEY, sinEsta)
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Método no permitido' })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
