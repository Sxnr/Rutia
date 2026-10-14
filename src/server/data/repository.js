import { poisCollection } from './db/poisCollection.js'

// Capa Servidor: Repositorio de POIs (Abstracción de BD) + ODM (Mongoose simulado)
// Repo -> ODM -> CollPOI
export const poisRepository = {
  // Nuevo: usado por routeService.js — solo filtra, no elige (cohesión)
  async buscarCandidatos({ intereses, presupuesto, duracionMaxMin }) {
    // Filtra por intereses y por límites individuales (no acumulado)
    const candidatos = poisCollection.filter(p =>
      intereses.includes(p.categoria) &&
      p.costo <= presupuesto &&
      p.tiempoMin <= duracionMaxMin
    )
    await new Promise(r => setTimeout(r, 80))
    // Retorna tal cual viene de BD (sin mapear), el servicio decide
    return candidatos
  },

  // Legacy usado por borrador anterior — se mantiene por compatibilidad
  // Simula Mongoose ODM find(filtros)
  async findByFiltros({ intereses, presupuesto, tiempo }) {
    // ODM: find(filtros) => CollPOI
    const maxCostoTotal = presupuesto
    const maxTiempoMin = tiempo * 60

    // Filtrado por intereses (Repo mapea entidades variables)
    let candidatos = poisCollection.filter(p => intereses.includes(p.categoria))

    // Ordena por costo/beneficio: gratis primero, luego tiempo corto
    candidatos.sort((a, b) => a.costo - b.costo || a.tiempoMin - b.tiempoMin)

    // Arma selección que quepa en tiempo y presupuesto (Motor lo reutiliza pero repo entrega bruto)
    const seleccion = []
    let costoAcum = 0
    let tiempoAcum = 0
    for (const poi of candidatos) {
      if (costoAcum + poi.costo <= maxCostoTotal && tiempoAcum + poi.tiempoMin <= maxTiempoMin) {
        // Mapeo a Entidades: normaliza esquemas variables
        seleccion.push({
          ...poi,
          costoLabel: poi.costo === 0 ? "$0 (Gratis)" : `$${poi.costo.toLocaleString('es-CL')}`,
        })
        costoAcum += poi.costo
        tiempoAcum += poi.tiempoMin
      }
      if (seleccion.length >= 4) break
    }
    // Simula latencia ODM -> Repo
    await new Promise(r => setTimeout(r, 120))
    return { datosBrutos: seleccion, meta: { costoTotal: costoAcum, tiempoTotalMin: tiempoAcum, candidatos: candidatos.length } }
  },

  async findById(id) {
    await new Promise(r => setTimeout(r, 80))
    return poisCollection.find(p => p.id === id) || null
  },

  async findAll() {
    return poisCollection
  }
}
