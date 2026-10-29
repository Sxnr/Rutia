// Validaciones de formularios ANTES de llamar a la API.
// Usan los mismos límites que el backend (backend/app/presentation/schemas) para
// avisar al tiro; el backend igual vuelve a validar todo.
// Devuelven claves de i18n ("validacion.tiempoRango"), no textos: la pantalla las traduce.

export const LIMITES = {
  tiempoMinHoras: 1,
  tiempoMaxHoras: 8, // como el selector del Hito 1
  presupuestoMax: 1_000_000,
  passwordMin: 8,
  nombreMax: 80,
}

const PATRON_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function resultado(errores) {
  return { valido: Object.keys(errores).length === 0, errores }
}

export function validarPreferencias({ tiempoHoras, presupuesto, intereses }) {
  const errores = {}
  if (!(tiempoHoras >= LIMITES.tiempoMinHoras && tiempoHoras <= LIMITES.tiempoMaxHoras)) {
    errores.tiempo = 'validacion.tiempoRango'
  }
  if (!Number.isInteger(presupuesto) || presupuesto < 0 || presupuesto > LIMITES.presupuestoMax) {
    errores.presupuesto = 'validacion.presupuestoRango'
  }
  if (!Array.isArray(intereses) || intereses.length === 0) {
    errores.intereses = 'validacion.interesesMinimo'
  }
  return resultado(errores)
}

export function validarLogin({ email, password }) {
  const errores = {}
  if (!PATRON_EMAIL.test((email || '').trim())) errores.email = 'validacion.emailInvalido'
  if (!password) errores.password = 'validacion.passwordRequerida'
  return resultado(errores)
}

export function validarRegistro({ nombre, email, password, password2 }) {
  const errores = {}
  const limpio = (nombre || '').trim()
  if (!limpio || limpio.length > LIMITES.nombreMax) errores.nombre = 'validacion.nombreRequerido'
  if (!PATRON_EMAIL.test((email || '').trim())) errores.email = 'validacion.emailInvalido'
  if (!password || password.length < LIMITES.passwordMin) errores.password = 'validacion.passwordCorta'
  if (password !== password2) errores.password2 = 'validacion.passwordDistinta'
  return resultado(errores)
}

export function validarNombreRuta(nombre) {
  const limpio = (nombre || '').trim()
  return resultado(!limpio || limpio.length > LIMITES.nombreMax ? { nombre: 'validacion.nombreRuta' } : {})
}

// "$15.000" → 15000; "" → null (campo vacío)
export function leerMonto(texto) {
  const digitos = String(texto ?? '').replace(/\D/g, '')
  return digitos === '' ? null : Number(digitos)
}
