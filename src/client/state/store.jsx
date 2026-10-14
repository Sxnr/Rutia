import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../http/httpClient.js'

// Capa Cliente: Gestor de Estado (State) + Interfaz P02
// UI -> State -> HTTP según Arq. Técnica
const RouteCtx = createContext(null)

export function RouteProvider({ children }) {
  const [preferencias, setPreferencias] = useState({ tiempo: 3.5, presupuesto: 15000, intereses: ['Museos', 'Histórico'] })
  const [itinerario, setItinerario] = useState(null)
  const [rutaGuardada, setRutaGuardada] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [poiDetalle, setPoiDetalle] = useState(null)
  const [lugares, setLugares] = useState([])

  // Carga el catálogo de lugares al montar (vía cliente HTTP -> negocio -> datos)
  useEffect(() => {
    cargarLugares()
  }, [])

  async function cargarLugares() {
    try {
      const data = await api.listarLugares()
      setLugares(data)
    } catch { /* silencioso: la home muestra lista vacía */ }
  }

  // State -> HTTP -> Router
  async function generarRuta(nuevasPrefs) {
    const prefs = nuevasPrefs || preferencias
    setLoading(true); setError(null)
    try {
      const data = await api.sugerirRuta(prefs)
      setItinerario(data)
      return data
    } catch (e) {
      setError(e.message || "Error al generar")
      throw e
    } finally { setLoading(false) }
  }

  async function cargarPoi(id) {
    setLoading(true)
    try {
      const poi = await api.getPoi(id)
      setPoiDetalle(poi)
      return poi
    } finally { setLoading(false) }
  }

  function guardarRuta() {
    if (itinerario) setRutaGuardada({ ...itinerario, guardadaEn: new Date().toISOString() })
  }

  // Pide a la capa de negocio (vía HTTP) que recalcule duración y costo
  async function recalcularDesde(paradas) {
    return api.recalcularRuta(paradas.map(p => p.id))
  }

  async function aplicarParadas(nuevasParadas, enGuardada = false) {
    const elegir = enGuardada ? rutaGuardada : itinerario
    const aplicar = enGuardada ? setRutaGuardada : setItinerario
    if (!elegir) return
    const patch = await recalcularDesde(nuevasParadas)
    aplicar({ ...elegir, ...patch })
  }

  async function reordenarParadas(origen, destino, enGuardada = false) {
    const elegir = enGuardada ? rutaGuardada : itinerario
    if (!elegir?.paradas) return
    if (destino < 0 || destino >= elegir.paradas.length) return
    const nuevas = [...elegir.paradas]
    const [movida] = nuevas.splice(origen, 1)
    nuevas.splice(destino, 0, movida)
    await aplicarParadas(nuevas, enGuardada)
  }

  async function eliminarParada(id, enGuardada = false) {
    const elegir = enGuardada ? rutaGuardada : itinerario
    if (!elegir?.paradas) return
    const nuevas = elegir.paradas.filter(p => p.id !== id)
    await aplicarParadas(nuevas, enGuardada)
  }

  async function vaciarItinerario(enGuardada = false) {
    const elegir = enGuardada ? rutaGuardada : itinerario
    if (!elegir) return
    await aplicarParadas([], enGuardada)
  }

  return (
    <RouteCtx.Provider value={{
      preferencias, setPreferencias,
      itinerario, setItinerario,
      rutaGuardada, setRutaGuardada, guardarRuta,
      reordenarParadas, eliminarParada, vaciarItinerario,
      poiDetalle, cargarPoi,
      lugares, cargarLugares,
      loading, error, generarRuta
    }}>
      {children}
    </RouteCtx.Provider>
  )
}

export function useRouteStore() {
  const ctx = useContext(RouteCtx)
  if (!ctx) throw new Error("useRouteStore fuera de RouteProvider")
  return ctx
}
