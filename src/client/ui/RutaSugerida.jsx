import { motion } from 'framer-motion'
import { IconTrash } from './icons.jsx'

export default function RutaSugerida({ itinerario, setItinerario, setPantalla, handleGuardar, tituloEditando, setTituloEditando, tituloTemp, setTituloTemp, visitados, toggleVisitado, reordenarParadas, handleEliminarParada, abrirFichaPoi }) {
  return (
    <motion.div key="ruta" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="pb-36 bg-[#F4F0E6]">
      <div className="relative h-[264px] w-full overflow-hidden">
        <img src={itinerario?.paradas?.[0]?.imagen || "https://commons.wikimedia.org/wiki/Special:FilePath/Museo%20Nacional%20de%20Bellas%20Artes%20Santiago.jpg?width=1200"} alt="Ruta" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#142C50]/85 via-[#142C50]/35 to-[#142C50]/10" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <button onClick={()=> setPantalla('HOME')} className="bg-white px-4 py-2 rounded-full text-[13px] font-extrabold shadow-md text-[#142C50] flex items-center gap-1.5 border border-white leading-none"><span className="text-[16px]">‹</span> Rutia</button>
          <button onClick={handleGuardar} className="w-9 h-9 rounded-full bg-[#E0A526] grid place-items-center shadow-md text-[#142C50] border border-white">♡</button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
          <p className="text-[11px] font-extrabold tracking-widest uppercase text-white/80">Ruta sugerida</p>
          <div className="inline-flex items-center bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-[#142C50] shadow border border-white gap-1.5 mt-1.5">
            <span>{itinerario?.duracionTotal || "3h 15m"}</span><span className="w-1 h-1 bg-[#7D8A9A] rounded-full"/><span>{itinerario?.costoTotal || "$8.500"}</span>
          </div>
          {tituloEditando ? (
            <div className="mt-2 flex gap-2">
              <input value={tituloTemp} onChange={e => setTituloTemp(e.target.value)} maxLength={60} placeholder="Nombre de tu ruta" className="flex-1 bg-white text-[#142C50] text-sm font-bold rounded-xl px-3 py-2 outline-none" autoFocus />
              <button onClick={() => { if (tituloTemp.trim() && itinerario) setItinerario({ ...itinerario, titulo: tituloTemp.trim() }); setTituloEditando(false) }} className="bg-[#E0A526] text-[#142C50] text-xs font-extrabold px-3 py-2 rounded-xl">Guardar</button>
            </div>
          ) : (
            <button onClick={() => { setTituloTemp(itinerario?.titulo || ''); setTituloEditando(true) }} className="block text-left w-full group" title="Toca para editar el nombre">
              <h1 className="text-[20px] font-extrabold leading-tight mt-2 text-white drop-shadow-md">{itinerario?.titulo || "Ruta Bellas Artes & Forestal"} <span className="text-sm opacity-70">✏️</span></h1>
            </button>
          )}
        </div>
      </div>

      <div className="px-5 mt-6">
        <h3 className="font-extrabold text-[#142C50]">Tu itinerario</h3>
        <p className="text-xs text-[#7D8A9A] mt-1 font-medium">Toca el checkbox al visitar y <span className="inline-flex align-middle w-4 h-4 rounded-full bg-white border border-[#FECACA] text-red-500 items-center justify-center mx-1"><IconTrash/></span> para quitar lugares.</p>
        <div className="mt-4 space-y-3">
          {(itinerario?.paradas || []).map((p,i)=> {
            const hecho = visitados.has(p.id)
            return (
              <div key={p.id || p.nombre} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <label className={`w-8 h-8 rounded-full grid place-items-center text-xs font-extrabold border-2 cursor-pointer transition ${hecho ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-[#7D8A9A] border-[#7D8A9A]/30 hover:border-[#142C50]'}`}>
                    <input type="checkbox" checked={hecho} onChange={()=> toggleVisitado(p.id)} className="sr-only" />
                    {hecho ? '✓' : i+1}
                  </label>
                  {i < (itinerario?.paradas?.length-1) && <div className={`w-0.5 flex-1 mt-1 ${hecho ? 'bg-emerald-200' : 'bg-[#F4F0E6]'}`} style={{ minHeight: 32 }}/>}
                </div>
                <div className={`flex-1 border rounded-2xl p-3 flex gap-3 shadow-sm text-left transition relative ${hecho ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#7D8A9A]/30 hover:border-[#142C50]'}`}>
                  <button onClick={()=> abrirFichaPoi(p)} className="flex gap-3 flex-1 text-left min-w-0">
                    <img src={p.imagen} alt={p.nombre} onError={(e)=>{ if(p.fallback && e.currentTarget.src!==p.fallback) e.currentTarget.src=p.fallback }} className={`w-16 h-16 rounded-xl object-cover border flex-shrink-0 ${hecho ? 'border-emerald-200 opacity-70' : 'border-[#7D8A9A]/30'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-extrabold leading-tight truncate ${hecho ? 'text-emerald-700 line-through' : 'text-[#142C50]'}`}>{p.nombre}</p>
                      <p className="text-xs text-[#7D8A9A] mt-0.5 font-medium">{p.hora}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${hecho ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-[#F4F0E6] text-[#142C50] border-[#7D8A9A]/30'}`}>{hecho ? 'Visitado' : p.costoLabel}</span>
                      </div>
                    </div>
                  </button>
                  <div className="flex flex-col gap-1 flex-shrink-0 self-center">
                    <button onClick={()=> reordenarParadas(i, i - 1)} disabled={i === 0} className="w-8 h-7 rounded-full bg-white border border-[#7D8A9A]/30 text-[#142C50] grid place-items-center text-xs disabled:opacity-30" title="Subir lugar">↑</button>
                    <button onClick={()=> reordenarParadas(i, i + 1)} disabled={i === (itinerario?.paradas?.length - 1)} className="w-8 h-7 rounded-full bg-white border border-[#7D8A9A]/30 text-[#142C50] grid place-items-center text-xs disabled:opacity-30" title="Bajar lugar">↓</button>
                    <button onClick={()=> handleEliminarParada(p.id)} className="w-8 h-8 rounded-full bg-white border border-[#FECACA] text-red-500 hover:bg-red-50 grid place-items-center" title="Quitar de la ruta">
                      <IconTrash/>
                    </button>
                  </div>
                  <button onClick={()=> abrirFichaPoi(p)} className="absolute -right-1 top-1/2 -translate-y-1/2 w-6 h-6 hidden">›</button>
                </div>
              </div>
            )
          })}
          {(!itinerario || itinerario.paradas.length===0) && <p className="text-xs text-[#7D8A9A] bg-white border border-dashed border-[#7D8A9A]/30 rounded-xl p-4 text-center">Sin lugares. Genera otra ruta o ajusta tu presupuesto/tiempo.</p>}
        </div>
        {itinerario?.paradas?.length > 1 && (
          <button onClick={()=> setItinerario({...itinerario, paradas: []})} className="mt-3 w-full text-xs font-bold text-red-500 hover:text-red-600">Vaciar itinerario</button>
        )}
      </div>
      <div className="px-5 mt-6 flex gap-3">
        <button onClick={()=> setPantalla('FORM')} className="flex-1 bg-white border border-[#7D8A9A]/30 font-extrabold py-3.5 rounded-full text-sm text-[#142C50]">← Ajustar ruta</button>
        <button onClick={handleGuardar} className="flex-1 bg-[#E0A526] text-[#142C50] font-extrabold py-3.5 rounded-full text-sm shadow border border-[#E0A526]">Guardar ruta</button>
      </div>
      <div className="px-5 mt-3"><button onClick={()=> setPantalla('HOME')} className="w-full bg-[#142C50] text-white font-extrabold py-3.5 rounded-full text-sm">Volver al inicio</button></div>
    </motion.div>
  )
}
