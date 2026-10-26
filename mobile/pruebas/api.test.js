// Prueba el cliente HTTP de la app contra el backend REAL.
// Requiere el backend levantado (cd backend && uvicorn app.main:app). Si no responde, se salta.
// Otra dirección: RUTIA_API_URL=http://192.168.1.50:8000/api/v1 npm test
import assert from 'node:assert/strict'
import { before, describe, test } from 'node:test'

import { crearCliente, ErrorApi } from '../src/api/cliente.js'
import { crearApiRutia } from '../src/api/rutia.js'

const URL_API = process.env.RUTIA_API_URL || 'http://localhost:8000/api/v1'
let idioma = 'es'
const api = crearApiRutia(crearCliente({ baseUrl: URL_API, obtenerIdioma: () => idioma }))

let backendDisponible = false
try {
  await api.salud()
  backendDisponible = true
} catch {
  backendDisponible = false
}

describe('cliente HTTP contra el backend', { skip: !backendDisponible && `backend no disponible en ${URL_API}` }, () => {
  let usuario
  let lugaresRuta

  before(async () => {
    idioma = 'es'
    usuario = await api.registrarse({
      nombre: 'Prueba App',
      email: `app-${Date.now()}@ejemplo.com`,
      password: 'clave-segura-123',
    })
  })

  test('categorías y lugares en el idioma pedido', async () => {
    const categorias = await api.categorias()
    assert.ok(categorias.some((c) => c.codigo === 'museos' && c.nombre === 'Museos'))
    idioma = 'en'
    const enIngles = await api.categorias()
    assert.ok(enIngles.some((c) => c.codigo === 'museos' && c.nombre === 'Museums'))
    idioma = 'es'

    const pagina = await api.lugares({ categoria: 'museos' })
    assert.ok(pagina.total >= 1)
    assert.ok(pagina.datos.every((l) => l.categoria.codigo === 'museos'))
    const lugar = await api.lugar(pagina.datos[0].id)
    assert.equal(lugar.id, pagina.datos[0].id)
  })

  test('generar ruta del caso Daniel', async () => {
    const ruta = await api.generarRuta({ tiempoHoras: 4, presupuesto: 15000, intereses: ['museos', 'gastronomia'] })
    assert.ok(ruta.paradas.length >= 1)
    assert.ok(ruta.costo_total_clp <= 15000)
    assert.ok(ruta.duracion_total_min <= 240)
    lugaresRuta = ruta.paradas.map((p) => p.lugar.id)
  })

  test('iniciar sesión', async () => {
    const yo = await api.iniciarSesion({ email: usuario.email, password: 'clave-segura-123' })
    assert.equal(yo.id, usuario.id)
    await assert.rejects(api.iniciarSesion({ email: usuario.email, password: 'mala' }), (e) => e.status === 401)
  })

  test('guardar, reordenar y borrar una ruta', async () => {
    const guardada = await api.guardarRuta({ usuarioId: usuario.id, nombre: 'Desde la app', lugares: lugaresRuta, tiempoHoras: 4, presupuesto: 15000 })
    assert.equal(guardada.paradas.length, lugaresRuta.length)

    const invertida = [...lugaresRuta].reverse()
    const editada = await api.actualizarRuta(guardada.id, { nombre: 'Al revés', lugares: invertida })
    assert.deepEqual(editada.paradas.map((p) => p.lugar.id), invertida)
    assert.equal(editada.nombre, 'Al revés')

    const mias = await api.rutasDeUsuario(usuario.id)
    assert.ok(mias.some((r) => r.id === guardada.id))

    assert.equal(await api.borrarRuta(guardada.id), null) // 204 sin cuerpo
    await assert.rejects(api.ruta(guardada.id), (e) => e instanceof ErrorApi && e.status === 404)
  })

  test('marcar, listar y quitar visitas', async () => {
    const visita = await api.marcarVisitado({ usuarioId: usuario.id, lugarId: lugaresRuta[0] })
    const visitas = await api.visitas(usuario.id)
    assert.equal(visitas[0].id, visita.id)
    assert.equal(visitas[0].lugar.id, lugaresRuta[0])
    await api.borrarVisita(visita.id)
    assert.equal((await api.visitas(usuario.id)).length, 0)
  })

  test('los errores llegan con código y mensaje traducido', async () => {
    idioma = 'en'
    await assert.rejects(api.lugar(99999), (e) => {
      assert.equal(e.codigo, 'LUGAR_NO_ENCONTRADO')
      assert.equal(e.mensaje, 'There is no place with id 99999.')
      return true
    })
    idioma = 'es'
    await assert.rejects(api.generarRuta({ tiempoHoras: 0, presupuesto: -1, intereses: [] }), (e) => {
      assert.equal(e.status, 422)
      assert.equal(e.detalles.length, 3)
      return true
    })
  })
})

test('sin backend: error SIN_CONEXION en vez de una excepción rara', async () => {
  const sinServidor = crearApiRutia(crearCliente({ baseUrl: 'http://127.0.0.1:9/api/v1' }))
  await assert.rejects(sinServidor.categorias(), (e) => e instanceof ErrorApi && e.codigo === 'SIN_CONEXION' && e.status === 0)
})

test('servidor lento: error SIN_RESPUESTA al pasar el tiempo máximo', async () => {
  const fetchLento = (_url, { signal }) =>
    new Promise((_resolver, rechazar) => signal.addEventListener('abort', () => rechazar(Object.assign(new Error('abort'), { name: 'AbortError' }))))
  const lento = crearApiRutia(crearCliente({ baseUrl: 'http://x', tiempoMaximoMs: 50, fetchImpl: fetchLento }))
  await assert.rejects(lento.categorias(), (e) => e.codigo === 'SIN_RESPUESTA')
})
