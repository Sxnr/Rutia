import axios from 'axios'
import { postRutaSugerir, getPoiDetalle } from '../server/router.js'

// Capa Cliente: Cliente HTTP (Axios) - directo a Router, sin Nginx/PM2
// UI -> State -> HTTP == POST ==> Router (según Arq. Técnica sin Infra)

const http = axios.create({
  baseURL: "/api",
  timeout: 4000,
})

// Interceptor simula red local sin Nginx
http.interceptors.request.use(cfg => {
  // console.debug("[HTTP] POST", cfg.url)
  return cfg
})

// Mock adapter: intercepta POST /api/v1/routes/generate (convención arquitectura) y rutea al Router simulado
async function mockPost(url, data) {
  if (url.includes("/api/v1/routes/generate") || url.includes("/rutas/sugerir")) {
    return postRutaSugerir(data)
  }
  throw new Error("Ruta no mockeada: " + url)
}
async function mockGet(url) {
  if (url.includes("/pois/")) {
    const id = url.split("/").pop()
    return getPoiDetalle(id)
  }
  throw new Error("GET no mockeado: " + url)
}

export const api = {
  // 1. Petición POST directa a Router (sin Nginx)
  async sugerirRuta(preferencias) {
    const res = await mockPost("/api/v1/routes/generate", preferencias)
    // 7. Respuesta -> HTTP -> State -> UI
    return res.data
  },
  async getPoi(id) {
    const res = await mockGet(`/pois/${id}`)
    return res.data
  },
  http,
}
