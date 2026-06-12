import { hoyISO } from './util'

// Suma/resta días a una fecha ISO (YYYY-MM-DD) sin problemas de zona horaria.
export function addDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + n)
  return dt.toISOString().slice(0, 10)
}

export function diasConRuta(rutas) {
  return [...new Set(rutas.filter((r) => r.completado).map((r) => r.fecha))].sort()
}

// Racha actual (consecutiva, terminando hoy o ayer) y mejor racha histórica.
// Sin culpa: si te saltas un día, la racha actual se reinicia pero la mejor se conserva.
export function calcularRacha(rutas) {
  const dias = diasConRuta(rutas)
  if (!dias.length) return { actual: 0, mejor: 0 }
  const set = new Set(dias)

  let mejor = 0
  for (const d of dias) {
    if (!set.has(addDias(d, -1))) {
      let len = 1
      let cur = d
      while (set.has(addDias(cur, 1))) {
        cur = addDias(cur, 1)
        len++
      }
      mejor = Math.max(mejor, len)
    }
  }

  const hoy = hoyISO()
  const ayer = addDias(hoy, -1)
  let fin = set.has(hoy) ? hoy : set.has(ayer) ? ayer : null
  let actual = 0
  if (fin) {
    let cur = fin
    while (set.has(cur)) {
      actual++
      cur = addDias(cur, -1)
    }
  }
  return { actual, mejor }
}
