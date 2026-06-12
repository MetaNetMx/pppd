import { getAutoreportes, getDiario, getRutas } from './db'
import { calcularRacha } from './progreso'
import { fechaLarga } from './util'

// Genera un informe imprimible (HTML) y abre el diálogo de impresión del navegador,
// desde donde se puede "Guardar como PDF". Sin dependencias. Pensado para llevarlo al
// especialista vestibular. Deja claro que NO es un documento diagnóstico.
export async function exportarInformePDF() {
  const [reportes, diario, rutas] = await Promise.all([
    getAutoreportes(),
    getDiario(),
    getRutas(),
  ])
  const racha = calcularRacha(rutas)
  const completadas = rutas.filter((r) => r.completado).length

  const filasReportes = reportes
    .slice()
    .reverse()
    .map(
      (r) =>
        `<tr><td>${fechaLarga(r.fecha)}</td><td>${r.dhi ?? '—'}</td><td>${r.npq ?? '—'}</td></tr>`,
    )
    .join('')

  const filasDiario = diario
    .filter((d) => d.malestar != null || d.nota)
    .slice()
    .reverse()
    .slice(0, 30)
    .map(
      (d) =>
        `<tr><td>${fechaLarga(d.fecha)}</td><td style="text-align:center">${
          d.malestar ?? '—'
        }</td><td>${(d.nota || '').replace(/</g, '&lt;')}</td></tr>`,
    )
    .join('')

  const html = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8">
<title>Informe de progreso · Ruta Calma</title>
<style>
  body{font-family:Georgia,serif;color:#1E5050;max-width:760px;margin:32px auto;padding:0 24px;line-height:1.6}
  h1{font-size:28px;margin:0 0 4px} h2{font-size:18px;border-bottom:2px solid #8A9E9A;padding-bottom:4px;margin-top:28px}
  .sub{color:#4E7E7A;margin:0 0 16px}
  .cards{display:flex;gap:12px;margin:16px 0}
  .card{flex:1;border:1px solid #8A9E9A;border-radius:12px;padding:12px;text-align:center}
  .card b{display:block;font-size:30px;color:#1E5050}
  table{width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px}
  th,td{border:1px solid #cdd9d2;padding:6px 8px;text-align:left} th{background:#eef2ee}
  .aviso{background:#f3f7f4;border:1px solid #8A9E9A;border-radius:10px;padding:12px;font-family:Arial,sans-serif;font-size:12px;color:#4E7E7A;margin-top:24px}
  @media print{ body{margin:0} button{display:none} }
</style></head><body>
  <h1>Informe de progreso</h1>
  <p class="sub">Ruta Calma — apoyo de autocuidado para PPPD · generado el ${fechaLarga(
    new Date().toISOString().slice(0, 10),
  )}</p>

  <div class="cards">
    <div class="card"><b>${completadas}</b>rutas completadas</div>
    <div class="card"><b>${racha.actual}</b>racha actual (días)</div>
    <div class="card"><b>${racha.mejor}</b>mejor racha</div>
    <div class="card"><b>${reportes.length}</b>autorreportes</div>
  </div>

  <h2>Autorreportes (DHI corto 0–100 · NPQ corto 0–36)</h2>
  ${
    filasReportes
      ? `<table><thead><tr><th>Fecha</th><th>DHI</th><th>NPQ</th></tr></thead><tbody>${filasReportes}</tbody></table>`
      : '<p>Sin autorreportes registrados.</p>'
  }

  <h2>Diario reciente (malestar 0–10)</h2>
  ${
    filasDiario
      ? `<table><thead><tr><th>Fecha</th><th>Malestar</th><th>Nota</th></tr></thead><tbody>${filasDiario}</tbody></table>`
      : '<p>Sin entradas de diario.</p>'
  }

  <div class="aviso">
    <strong>Nota:</strong> Este informe resume el autoseguimiento de la persona usando una versión
    <em>simplificada</em> de las escalas DHI y NPQ. No es un instrumento diagnóstico ni reemplaza la
    valoración clínica. Se comparte como apoyo a la consulta con el especialista vestibular.
  </div>

  <button onclick="window.print()" style="margin-top:20px;padding:10px 18px;border:0;border-radius:999px;background:#1E5050;color:#F5EFE0;font:600 14px Arial;cursor:pointer">Imprimir / Guardar PDF</button>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) {
    alert('Permite las ventanas emergentes para generar el informe.')
    return
  }
  win.document.write(html)
  win.document.close()
}
