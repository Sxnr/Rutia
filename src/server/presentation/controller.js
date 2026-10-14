import { sugerirRuta, recalcularItinerario } from '../business/routeService.js'

// controller.js — CAPA DE PRESENTACIÓN (delgado)
// Traduce HTTP ↔ negocio. NO contiene reglas de la ruta.

function fmtDuracion(min) {
  return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`
}

// Convierte paradas de negocio en paradas listas para la UI (solo etiquetas/legibilidad)
function mapearParadas(paradasServicio) {
  return paradasServicio.map((p, i) => {
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
      distanciaSig: i < paradasServicio.length - 1 ? `${p.trasladoMin > 0 ? p.trasladoMin * 80 : 320}m a pie` : "fin",
      imagen: poi.imagen,
      coords: poi.coords,
      horario: poi.horario,
      meta: poi.meta,
      orden: p.orden,
    }
  })
}

export async function motorDeFiltrado({ tiempo, presupuesto, intereses }) {
  // Delega toda la lógica a la capa de negocio
  const { duracionTotalMin, costoTotalClp, paradas: paradasServicio, mensaje } = await sugerirRuta({ tiempo, presupuesto, intereses })

  if (paradasServicio.length === 0) {
    return {
      titulo: "Sin resultados",
      duracionTotal: "0h 00m",
      distancia: "—",
      costoTotal: "$0",
      paradas: [],
      meta: { costoTotal: 0, tiempoTotalMin: 0, viable: false, mensaje },
    }
  }

  const paradas = mapearParadas(paradasServicio)

  const itinerario = {
    titulo: intereses.includes("Museos") ? "Ruta Bellas Artes & Forestal" : "Ruta Hiper-Local Optimizada",
    duracionTotal: fmtDuracion(duracionTotalMin),
    distancia: `${(paradas.length * 0.6).toFixed(1)} km a pie`,
    costoTotal: `$${costoTotalClp.toLocaleString('es-CL')}`,
    paradas,
    meta: { costoTotal: costoTotalClp, tiempoTotalMin: duracionTotalMin, viable: true },
  }

  await new Promise(r => setTimeout(r, 120))
  return itinerario
}

// Recálculo de una ruta ya armada (eliminar / reordenar / vaciar paradas).
// La capa de negocio recalcula duración y costo con datos de la capa de datos.
export async function recalcularItinerarioController({ paradas }) {
  const { duracionTotalMin, costoTotalClp, paradas: paradasServicio } = await recalcularItinerario({ paradas })
  const paradasMapeadas = mapearParadas(paradasServicio)

  await new Promise(r => setTimeout(r, 60))
  return {
    duracionTotal: fmtDuracion(duracionTotalMin),
    distancia: `${(paradasMapeadas.length * 0.6).toFixed(1)} km a pie`,
    costoTotal: `$${costoTotalClp.toLocaleString('es-CL')}`,
    paradas: paradasMapeadas,
    meta: { costoTotal: costoTotalClp, tiempoTotalMin: duracionTotalMin, viable: paradasMapeadas.length > 0 },
  }
}
