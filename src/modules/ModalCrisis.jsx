import Aviso from '../components/Aviso'

// Manejo básico de crisis. Mensaje de derivación, sin técnicas que usen dolor o malestar físico.
// Incluye un anclaje suave opcional, pero prioriza pedir ayuda.
export default function ModalCrisis({ onCerrar }) {
  return (
    <div className="fixed inset-0 z-50 bg-bosque/40 backdrop-blur-sm grid place-items-end sm:place-items-center p-4">
      <div className="tarjeta bg-arena p-6 max-w-md w-full space-y-4 animate-aparece">
        <h2 className="text-2xl text-pino">Estás en un momento difícil</h2>
        <p className="text-jade/90">
          Lo que sientes es real y puede ser muy intenso, pero el mareo del PPPD, por sí mismo, no es
          peligroso. Suele subir como una ola y luego baja. No estás en peligro por marearte.
        </p>

        <div className="rounded-2xl bg-salvia/15 p-4 space-y-2">
          <p className="text-sm font-semibold text-pino">Un ancla, si te sirve:</p>
          <p className="text-sm text-jade">
            Apoya los pies en el suelo. Nombra 3 cosas que ves, 2 que oyes, 1 que tocas. Respira:
            entra suave, y suelta el aire largo. No tienes que hacer que la sensación desaparezca,
            solo dejar que pase.
          </p>
        </div>

        <Aviso tono="fuerte">
          Si tienes pensamientos de hacerte daño, te sientes en peligro, o aparecen síntomas nuevos y
          alarmantes (pérdida de fuerza, del habla, de la visión, dolor de pecho), busca ayuda ahora:
          contacta a alguien de confianza o a los servicios de emergencia de tu país. En México, la
          Línea de la Vida: <strong>800 911 2000</strong>. Emergencias: <strong>911</strong>.
        </Aviso>

        <p className="text-xs text-salvia">
          Esta app no sustituye la atención profesional. Si las crisis se repiten, coméntalo con tu
          médico o especialista vestibular.
        </p>

        <button onClick={onCerrar} className="boton-primario w-full">
          Estoy mejor, volver
        </button>
      </div>
    </div>
  )
}
