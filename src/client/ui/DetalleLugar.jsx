import { motion } from 'framer-motion'

// Datos amigables reales por POI
const datosAmigables = {
  "poi_bellas_artes": { direccion: "José Miguel de la Barra 650, Recoleta", desc: "Colección más grande de arte chileno, desde la colonia hasta hoy. Salas con luz natural y esculturas en el hall.", tip: "Entrada liberada, propina voluntaria" },
  "poi_mac": { direccion: "Parque Forestal s/n, Quinta Normal", desc: "Arte contemporáneo chileno y latinoamericano en edificio neoclásico. Ideal para contrastar con Bellas Artes.", tip: "Martes gratis estudiantes" },
  "poi_emporio": { direccion: "Parque Forestal 027, Providencia", desc: "Café ícono con helados artesanales y tostadas. Terraza bajo los árboles frente al Museo.", tip: "Pide el helado de rosa" },
  "poi_mac_forestal": { direccion: "Parque Forestal s/n", desc: "Mismo edificio que Bellas Artes, ala contemporánea.", tip: "" },
  "poi_santalucia": { direccion: "Santa Lucía 170, Santiago Centro", desc: "Mirador 360° de Santiago, jardines y fuentes. Subida de 10 min, ideal al atardecer.", tip: "Lleva agua, no hay sombra arriba" },
  "poi_plaza": { direccion: "Plaza de Armas, Santiago Centro", desc: "Kilómetro cero de Chile, rodeada de Catedral y Municipalidad. Punto de encuentro histórico.", tip: "Cuidado con pertenencias" },
  "poi_moneda": { direccion: "Moneda S/N, Santiago", desc: "Palacio de Gobierno, cambio de guardia días impares 10:00.", tip: "Reserva visita guiada gratis" },
  "poi_chascona": { direccion: "Fernando Márquez de la Plata 0192, Providencia", desc: "Casa-museo de Pablo Neruda, llena de objetos marinos y amor por Matilde.", tip: "Audio guía incluida" },
  "poi_gam": { direccion: "Alameda 227, Santiago", desc: "Centro cultural con teatro, expos y ferias. Arquitectura moderna post-2010.", tip: "Entrada liberada" },
  "default": { direccion: "Santiago, Chile", desc: "Lugar seleccionado según tu tiempo y presupuesto.", tip: "Llega 5 min antes" }
}

export default function DetalleLugar({ poiFicha, setPantalla, visitados, toggleVisitado }) {
  const getDatoAmigable = (id) => datosAmigables[id] || datosAmigables["default"]
  return (
    <motion.div key="poi" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="pb-28 bg-[#F4F0E6]">
      <div className="relative h-56 w-full overflow-hidden">
        <img src={poiFicha.imagen} alt={poiFicha.nombre} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#142C50]/80 to-transparent" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <button onClick={()=> setPantalla('RUTA')} className="bg-white px-4 py-2 rounded-full text-xs font-extrabold text-[#142C50] shadow">‹ Volver</button>
          <label className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#7D8A9A]/30 shadow cursor-pointer">
            <input type="checkbox" checked={visitados.has(poiFicha.id)} onChange={()=> toggleVisitado(poiFicha.id)} className="w-4 h-4 rounded border-[#CBD5E1] text-emerald-600 focus:ring-emerald-500" />
            <span className="text-xs font-extrabold text-[#142C50]">{visitados.has(poiFicha.id) ? "Visitado" : "Marcar visitado"}</span>
          </label>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <span className="bg-white/95 text-[#142C50] text-xs font-bold px-2.5 py-1 rounded-full border border-white">{poiFicha.categoria}</span>
          <h1 className="text-lg font-extrabold text-white mt-2 leading-tight">{poiFicha.nombre}</h1>
        </div>
      </div>
      {poiFicha.credito && (
        <p className="px-5 pt-1.5 text-right text-[10px] leading-tight text-[#7D8A9A]">{poiFicha.credito}</p>
      )}
      <div className="px-5 mt-5 space-y-4">
        {/* Datos amigables reales */}
        <div className="bg-white border border-[#7D8A9A]/30 rounded-2xl p-4 shadow-sm">
          <h3 className="font-extrabold text-[#142C50]">Detalle del lugar</h3>
          <p className="text-sm text-[#7D8A9A] mt-2 leading-relaxed">{getDatoAmigable(poiFicha.id).desc}</p>
          <div className="mt-4 grid gap-2">
            <div className="flex items-start gap-3 bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl p-3">
              <span className="w-8 h-8 rounded-full bg-white border border-[#7D8A9A]/30 grid place-items-center text-sm flex-shrink-0">📍</span>
              <div><p className="text-xs font-extrabold text-[#142C50]">Dirección</p><p className="text-xs text-[#7D8A9A] mt-0.5">{getDatoAmigable(poiFicha.id).direccion}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-[#7D8A9A]">Horario</p><p className="text-xs font-extrabold text-[#142C50] mt-1">{poiFicha.horario}</p>
              </div>
              <div className="bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-[#7D8A9A]">Duración</p><p className="text-xs font-extrabold text-[#142C50] mt-1">{poiFicha.tiempoMin} min</p>
              </div>
              <div className="bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-[#7D8A9A]">Entrada</p><p className="text-xs font-extrabold text-[#142C50] mt-1">{poiFicha.costoLabel}</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-[#142C50]">Estado de visita</span>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${visitados.has(poiFicha.id) ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{visitados.has(poiFicha.id) ? '✓ Visitado' : 'Pendiente'}</span>
            </div>
          </div>
        </div>
        <button onClick={()=> setPantalla('HOME')} className="w-full bg-[#142C50] text-white font-extrabold py-3 rounded-full text-sm">Volver al inicio</button>
      </div>
    </motion.div>
  )
}
