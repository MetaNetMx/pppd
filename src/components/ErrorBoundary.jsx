import { Component } from 'react'

// Evita que un error en un módulo deje la app en blanco. Mensaje amable, sin alarmismo.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('Error en módulo:', error, info)
  }
  reintentar = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="tarjeta p-6 text-center space-y-4 my-6">
          <div className="text-4xl">🍃</div>
          <h2 className="text-2xl text-pino">Algo se atoró aquí</h2>
          <p className="text-jade/80 text-sm">
            No es culpa tuya y tus datos están a salvo. Respira y vuelve a intentarlo.
          </p>
          <button onClick={this.reintentar} className="boton-primario">
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
