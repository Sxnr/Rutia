import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ErrorApi } from '../src/api/cliente.js'
import { TEXTOS, traducir } from '../src/i18n/traducir.js'
import { mensajeDeError } from '../src/utilidades/errores.js'
import { formatearCosto, formatearDuracion, formatearFecha, formatearHoras, formatearPesos } from '../src/utilidades/formato.js'
import { urlImagen } from '../src/utilidades/imagenes.js'
import { leerMonto, validarLogin, validarNombreRuta, validarPreferencias, validarRegistro } from '../src/utilidades/validacion.js'

test('formato de pesos en español e inglés', () => {
  assert.equal(formatearPesos(15000), '$15.000')
  assert.equal(formatearPesos(1000000, 'en'), '$1,000,000')
  assert.equal(formatearPesos(500), '$500')
  assert.equal(formatearCosto(0, 'es', 'Gratis'), 'Gratis')
  assert.equal(formatearCosto(4500, 'es', 'Gratis'), '$4.500')
})

test('formato de duraciones y horas', () => {
  assert.equal(formatearDuracion(221), '3 h 41 min')
  assert.equal(formatearDuracion(45), '45 min')
  assert.equal(formatearDuracion(120), '2 h')
  assert.equal(formatearHoras(4.5), '4,5 h')
  assert.equal(formatearHoras(4.5, 'en'), '4.5 h')
})

test('formato de fechas', () => {
  const iso = new Date(2026, 9, 25, 12, 0).toISOString()
  assert.equal(formatearFecha(iso, 'es'), '25-10-2026')
  assert.equal(formatearFecha(iso, 'en'), '10/25/2026')
  assert.equal(formatearFecha('no es fecha'), '')
})

test('validación de preferencias con los mismos límites del backend', () => {
  assert.equal(validarPreferencias({ tiempoHoras: 4, presupuesto: 15000, intereses: ['museos'] }).valido, true)
  const malo = validarPreferencias({ tiempoHoras: 0, presupuesto: -1, intereses: [] })
  assert.deepEqual(Object.keys(malo.errores).sort(), ['intereses', 'presupuesto', 'tiempo'])
  assert.equal(validarPreferencias({ tiempoHoras: 13, presupuesto: 0, intereses: ['museos'] }).errores.tiempo, 'validacion.tiempoRango')
  assert.equal(validarPreferencias({ tiempoHoras: 4, presupuesto: 1_000_001, intereses: ['museos'] }).valido, false)
})

test('validación de login y registro', () => {
  assert.equal(validarLogin({ email: 'daniel@ejemplo.com', password: 'x' }).valido, true)
  assert.equal(validarLogin({ email: 'daniel', password: '' }).valido, false)
  const registro = validarRegistro({ nombre: ' ', email: 'a@b', password: 'corta', password2: 'otra' })
  assert.deepEqual(Object.keys(registro.errores).sort(), ['email', 'nombre', 'password', 'password2'])
  assert.equal(validarRegistro({ nombre: 'Daniel', email: 'd@e.cl', password: 'clave-segura', password2: 'clave-segura' }).valido, true)
  assert.equal(validarNombreRuta('   ').valido, false)
})

test('leer montos escritos con símbolos', () => {
  assert.equal(leerMonto('$15.000'), 15000)
  assert.equal(leerMonto(''), null)
  assert.equal(leerMonto('abc'), null)
})

test('las fotos con localhost apuntan al servidor real de la API', () => {
  const api = 'http://192.168.1.50:8000/api/v1'
  assert.equal(urlImagen('http://localhost:8000/fotos/gam.jpg', api), 'http://192.168.1.50:8000/fotos/gam.jpg')
  assert.equal(urlImagen('http://127.0.0.1:8000/fotos/gam.jpg', api), 'http://192.168.1.50:8000/fotos/gam.jpg')
  // Si la API también es local (navegador) o la foto ya es pública, no se toca
  assert.equal(urlImagen('http://localhost:8000/fotos/gam.jpg', 'http://localhost:8000/api/v1'), 'http://localhost:8000/fotos/gam.jpg')
  assert.equal(urlImagen('https://rutia.cl/fotos/gam.jpg', api), 'https://rutia.cl/fotos/gam.jpg')
  assert.equal(urlImagen(null, api), null)
})

test('mensajes de error para el usuario', () => {
  const t = (clave) => traducir(TEXTOS.es, clave)
  assert.equal(mensajeDeError(new ErrorApi({ status: 404, codigo: 'X', mensaje: 'No existe.' }), t), 'No existe.')
  assert.match(mensajeDeError(new ErrorApi({ status: 0, codigo: 'SIN_CONEXION', mensaje: null }), t), /No pudimos conectar/)
  assert.match(mensajeDeError(new ErrorApi({ status: 0, codigo: 'SIN_RESPUESTA', mensaje: null }), t), /tardó demasiado/)
  assert.match(mensajeDeError(new Error('raro'), t), /inesperado/)
})
