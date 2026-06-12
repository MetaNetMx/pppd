// Banda de aviso (médico / seguridad). Tono amable, no alarmista.
export default function Aviso({ children, tono = 'suave' }) {
  const estilos =
    tono === 'fuerte'
      ? 'bg-pino/10 border-pino/30 text-pino'
      : 'bg-salvia/15 border-salvia/30 text-jade'
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${estilos}`}>
      {children}
    </div>
  )
}
