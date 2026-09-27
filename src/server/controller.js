import { sugerirRuta } from './routeService.js'

// controller.js — CAPA DE PRESENTACIÓN (delgado)
// Traduce HTTP ↔ negocio. NO contiene reglas de la ruta.
export async function motorDeFiltrado({ tiempo, presupuesto, intereses }) {
  // Delega toda la lógica a la capa de negocio
  const { duracionTotalMin, costoTotalClp, paradas: paradasServicio, mensaje } = await sugerirRuta({ tiempo, presupuesto, intereses })

  if (paradasServicio.length === 0) {
    return {
      titulo: "Sin resultados",
      duracionTotal: "0h 00m",
      distancia: "—",
      costoTotal: "$0",
      horario: "—",
      precioEntrada: "—",
      paradas: [],
      meta: { costoTotal: 0, tiempoTotalMin: 0, viable: false, mensaje },
      trace: ["UI", "State", "HTTP POST /api/v1/routes/generate", "Router", "Zod", "Controller", "routeService", "Repo.buscarCandidatos", "CollPOI"]
    }
  }

  // Enriquecimiento para el prototipo: horas y distancia legible
  const paradas = paradasServicio.map((p, i) => {
    const startMin = 10 * 60 + 30 + i * 65
    const endMin = startMin + p.duracionMin
    const fmt = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`
    const poi = p._poi
    return {
      id: poi.id,
      nombre: poi.nombre,
      categoria: poi.categoria,
      costo: poi.costo,
      costoLabel: poi.costo === 0 ? "$0 (Gratis)" : `$${poi.costo.toLocaleString('es-CL')}`,
      tiempoMin: poi.tiempoMin,
      duracionMin: p.duracionMin,
      trasladoMin: p.trasladoMin,
      trasladoLabel: p.trasladoMin > 0 ? `${p.trasladoMin} min traslado` : "Inicio",
      hora: `${fmt(startMin)} - ${fmt(endMin)}`,
      distanciaSig: i < paradasServicio.length - 1 ? `${p.trasladoMin > 0 ? p.trasladoMin*80 : 320}m a pie` : "fin",
      imagen: poi.imagen,
      coords: poi.coords,
      horario: poi.horario,
      meta: poi.meta,
      orden: p.orden,
    }
  })

  const itinerario = {
    titulo: intereses.includes("Museos") ? "Ruta Bellas Artes & Forestal" : "Ruta Hiper-Local Optimizada",
    duracionTotal: `${Math.floor(duracionTotalMin/60)}h ${String(duracionTotalMin%60).padStart(2,'0')}m`,
    distancia: `${(paradas.length * 0.6).toFixed(1)} km a pie`,
    costoTotal: `$${costoTotalClp.toLocaleString('es-CL')}`,
    horario: "Mar-Dom 10:00-18:30",
    precioEntrada: "$3.000 General / $1.500 Estudiantes",
    paradas,
    meta: { costoTotal: costoTotalClp, tiempoTotalMin: duracionTotalMin, viable: true },
    trace: ["UI", "State", "HTTP POST /api/v1/routes/generate", "Router", "Zod", "Controller", "routeService", "Repo.buscarCandidatos", "CollPOI"]
  }

  await new Promise(r => setTimeout(r, 120))
  return itinerario
}
