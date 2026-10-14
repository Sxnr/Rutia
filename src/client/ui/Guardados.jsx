import { motion } from 'framer-motion'

export default function Guardados({ setPantalla, guardadosTab, setGuardadosTab, rutaGuardada, visitados, toggleVisitado, reordenarParadas, abrirFichaPoi, lugares }) {
  // Lugares del store (capa de datos) marcados como visitados en esta sesión
  const visitadosReales = (lugares || []).filter(l => visitados.has(l.id))
  return (
    <motion.div key="misrutas" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
      <div className="bg-white border-b border-[#7D8A9A]/30 px-5 pt-6 pb-4">
        <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#142C50]">‹ Volver</button>
        <h1 className="text-lg font-extrabold text-[#142C50] mt-1">Guardados</h1>
        <p className="text-sm text-[#7D8A9A]">Tus rutas y lugares guardados</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={()=> setGuardadosTab('rutas')} className={`py-2.5 rounded-full text-sm font-extrabold border ${guardadosTab==='rutas' ? 'bg-[#142C50] text-white border-[#142C50]' : 'bg-white border-[#7D8A9A]/30 text-[#7D8A9A]'}`}>Rutas guardadas</button>
          <button onClick={()=> setGuardadosTab('visitados')} className={`py-2.5 rounded-full text-sm font-extrabold border ${guardadosTab==='visitados' ? 'bg-[#142C50] text-white border-[#142C50]' : 'bg-white border-[#7D8A9A]/30 text-[#7D8A9A]'}`}>Lugares visitados</button>
        </div>
      </div>
      {guardadosTab === 'visitados' ? (
      <div className="px-5 mt-5">
        <h3 className="font-extrabold text-[#142C50] text-[15px]">Lugares visitados</h3>
        {visitadosReales.length === 0 ? (
          <div className="mt-3 bg-white border border-dashed border-[#7D8A9A]/30 rounded-2xl p-6 text-center">
            <p className="text-xs text-[#7D8A9A]">Aún no marcaste lugares como visitados.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#7D8A9A] mt-1">Lugares que marcaste como visitados.</p>
            <div className="mt-3 space-y-3">
              {visitadosReales.map(l => (
                <div key={l.id} className="bg-white border border-[#7D8A9A]/30 rounded-2xl p-3 flex gap-3 shadow-sm">
                  <img src={l.imagen} alt={l.nombre} className="w-16 h-16 rounded-xl object-cover border border-[#7D8A9A]/30" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#142C50] leading-tight truncate">{l.nombre}</p>
                    <p className="text-xs text-[#7D8A9A] mt-0.5">{l.categoria} • {l.horario}</p>
                    <p className="text-xs font-bold text-[#142C50] mt-1">{l.costo === 0 ? "Gratis" : `$${l.costo.toLocaleString('es-CL')}`} • {l.tiempoMin} min</p>
                  </div>
                  <span className="text-emerald-600 font-extrabold self-center">✓</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      ) : (
      <div className="px-5 mt-5">
        {!rutaGuardada ? (
          <div className="bg-white border border-dashed border-[#7D8A9A]/30 rounded-2xl p-8 text-center">
            <p className="text-3xl">🗺️</p>
            <p className="font-extrabold text-[#142C50] mt-2">Sin rutas guardadas</p>
            <p className="text-xs text-[#7D8A9A] mt-1">Genera una y pulsa “Guardar ruta”.</p>
            <button onClick={()=> setPantalla('FORM')} className="mt-4 bg-[#142C50] text-white font-extrabold px-5 py-2.5 rounded-full text-sm">Crear ruta</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-[#7D8A9A]/30 rounded-2xl overflow-hidden shadow-sm">
              <img src={rutaGuardada.paradas?.[0]?.imagen} alt={rutaGuardada.titulo} className="h-32 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-extrabold text-[#142C50]">{rutaGuardada.titulo}</h3>
                <p className="text-xs text-[#7D8A9A] mt-1">{rutaGuardada.duracionTotal} • {rutaGuardada.costoTotal}</p>
                <p className="text-xs text-[#7D8A9A] mt-1">Guardada: {new Date(rutaGuardada.guardadaEn).toLocaleString('es-CL')}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#142C50]"><span>Avance</span><span>{visitados.size}/{rutaGuardada.paradas.length}</span></div>
                  <div className="mt-1 h-2 bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${rutaGuardada.paradas.length ? (visitados.size/rutaGuardada.paradas.length)*100 : 0}%` }}/></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={()=> setPantalla('RUTA')} className="flex-1 bg-white border border-[#7D8A9A]/30 font-bold py-2 rounded-full text-sm text-[#142C50]">Ver itinerario</button>
                  <button onClick={()=> abrirFichaPoi(rutaGuardada.paradas[0])} className="flex-1 bg-[#E0A526] font-extrabold py-2 rounded-full text-sm text-[#142C50]">Ver detalle</button>
                </div>
                <div className="mt-4 bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl p-3">
                  <p className="text-xs font-extrabold text-[#142C50]">Checklist de esta ruta</p>
                  <div className="mt-2 space-y-1.5">
                    {rutaGuardada.paradas.map((p, idx)=> (
                      <div key={p.id} className="flex items-center gap-2 text-xs">
                        <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                          <input type="checkbox" checked={visitados.has(p.id)} onChange={()=> toggleVisitado(p.id)} className="w-4 h-4 rounded border-[#CBD5E1] text-[#142C50] focus:ring-[#142C50]" />
                          <span className={`truncate ${visitados.has(p.id) ? "line-through text-[#7D8A9A]" : "text-[#142C50] font-medium"}`}>{p.nombre}</span>
                          {visitados.has(p.id) && <span className="text-emerald-600 font-bold">✓</span>}
                        </label>
                        <button onClick={()=> reordenarParadas(idx, idx - 1, true)} disabled={idx === 0} className="w-6 h-6 rounded-full border border-[#7D8A9A]/30 grid place-items-center disabled:opacity-30" title="Subir">↑</button>
                        <button onClick={()=> reordenarParadas(idx, idx + 1, true)} disabled={idx === rutaGuardada.paradas.length - 1} className="w-6 h-6 rounded-full border border-[#7D8A9A]/30 grid place-items-center disabled:opacity-30" title="Bajar">↓</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </motion.div>
  )
}
