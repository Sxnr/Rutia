// Funciones de la API de Rutia (una por ruta de docs/hito-2/API.md).
// Las pantallas llaman a estas funciones; nunca arman URLs ni hacen fetch.
// TODO(Hito 3): usuario_id saldrá del token y dejará de viajar en la petición.

function consulta(parametros) {
  const partes = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(valor)}`)
  return partes.length ? `?${partes.join('&')}` : ''
}

export function crearApiRutia(cliente) {
  return {
    salud: () => cliente.get('/health'),

    // Catálogo
    categorias: () => cliente.get('/categorias'),
    lugares: ({ categoria, limit = 100, offset = 0 } = {}) =>
      cliente.get(`/lugares${consulta({ categoria, limit, offset })}`),
    lugar: (id) => cliente.get(`/lugares/${id}`),

    // Rutas
    generarRuta: ({ tiempoHoras, presupuesto, intereses, usuarioId = null, incluirVisitados = false }) =>
      cliente.post('/rutas/generar', {
        tiempo_horas: tiempoHoras,
        presupuesto_clp: presupuesto,
        intereses,
        usuario_id: usuarioId,
        incluir_visitados: incluirVisitados,
      }),
    guardarRuta: ({ usuarioId, nombre, lugares, tiempoHoras = null, presupuesto = null }) =>
      cliente.post('/rutas', {
        usuario_id: usuarioId,
        nombre,
        lugares,
        tiempo_horas: tiempoHoras,
        presupuesto_clp: presupuesto,
      }),
    rutasDeUsuario: (usuarioId) => cliente.get(`/usuarios/${usuarioId}/rutas`),
    ruta: (id) => cliente.get(`/rutas/${id}`),
    actualizarRuta: (id, { nombre, lugares, tiempoHoras = null, presupuesto = null }) =>
      cliente.put(`/rutas/${id}`, { nombre, lugares, tiempo_horas: tiempoHoras, presupuesto_clp: presupuesto }),
    borrarRuta: (id) => cliente.delete(`/rutas/${id}`),

    // Usuarios
    registrarse: ({ nombre, email, password, idioma = 'es' }) =>
      cliente.post('/usuarios', { nombre, email, password, idioma }),
    iniciarSesion: ({ email, password }) => cliente.post('/usuarios/login', { email, password }),

    // Visitas
    marcarVisitado: ({ usuarioId, lugarId, rutaId = null }) =>
      cliente.post(`/usuarios/${usuarioId}/visitas`, { lugar_id: lugarId, ruta_id: rutaId }),
    visitas: (usuarioId) => cliente.get(`/usuarios/${usuarioId}/visitas`),
    borrarVisita: (id) => cliente.delete(`/visitas/${id}`),
  }
}
