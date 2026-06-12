// Genera iconos PNG simples (color de marca) para la PWA, sin dependencias externas.
// Un tile sólido pino (#1E5050) con un punto arena al centro. Suficiente para instalar;
// reemplázalos por arte definitivo cuando quieras.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

function png(size) {
  const PINO = [30, 80, 80]
  const SALVIA = [138, 158, 154]
  const ARENA = [245, 239, 224]
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type RGB
  const cx = size / 2
  const cy = size / 2
  // Anillos concéntricos (marca): salvia exterior, arena interior, punto central.
  const rExt = size * 0.30
  const rInt = size * 0.17
  const grosor = size * 0.038
  const rDot = size * 0.055
  const near = (d, r) => Math.abs(d - r) <= grosor
  const raw = Buffer.alloc(size * (size * 3 + 1))
  let o = 0
  for (let y = 0; y < size; y++) {
    raw[o++] = 0 // filtro none
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx, y - cy)
      let c = PINO
      if (d <= rDot) c = ARENA
      else if (near(d, rInt)) c = ARENA
      else if (near(d, rExt)) c = SALVIA
      raw[o++] = c[0]
      raw[o++] = c[1]
      raw[o++] = c[2]
    }
  }
  const idat = deflateSync(raw)
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'public', 'icons')
mkdirSync(out, { recursive: true })
const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-512-maskable.png', 512],
]
for (const [name, size] of targets) {
  writeFileSync(join(out, name), png(size))
  console.log('icono:', name)
}
