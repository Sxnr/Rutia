import { motion } from 'framer-motion'

const categorias = ['Museos', 'Gastronomía', 'Histórico', 'Parques', 'Shopping', 'Vida Nocturna']

export default function Preferencias({ setPantalla, preferencias, setPreferencias, toggleInteres, errorForm, handleGenerar, loading }) {
  return (
    <motion.div key="form" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="flex flex-col h-[calc(100%-0px)] bg-[#F4F0E6]">
      <div className="flex-1 overflow-y-auto pb-2">
        <div className="bg-white border-b border-[#7D8A9A]/30 px-5 pt-6 pb-4">
          <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#142C50]">‹ Volver</button>
          <h1 className="text-lg font-extrabold text-[#142C50] mt-1">Preferencias</h1>
          <p className="text-sm text-[#7D8A9A] font-medium">Ajusta tus restricciones. Te mostramos solo lo viable.</p>
        </div>
        <div className="px-5 mt-5">
          <div className="bg-white border border-[#7D8A9A]/30 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-[#142C50] flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-[#F4F0E6] grid place-items-center text-sm border border-[#7D8A9A]/30">⏱</span> Tiempo disponible</h3>
              <span className="bg-[#142C50] text-white text-sm font-extrabold px-3 py-1.5 rounded-full">{preferencias.tiempo}h</span>
            </div>
            <input type="range" min="1" max="8" step="0.5" value={preferencias.tiempo} onChange={e=> setPreferencias({ ...preferencias, tiempo: parseFloat(e.target.value)})} className="w-full mt-5" />
            <div className="flex justify-between text-xs text-[#7D8A9A] mt-1 font-bold"><span>1h</span><span>4h</span><span>8h</span></div>
          </div>
        </div>
        <div className="px-5 mt-4">
          <div className="bg-white border border-[#7D8A9A]/30 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-[#142C50] flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-[#F4F0E6] grid place-items-center text-sm border border-[#7D8A9A]/30">💰</span> Presupuesto total (CLP)</h3>
            <div className="mt-4 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8A9A] font-bold">$</span>
              <input type="number" value={preferencias.presupuesto} onChange={e=> setPreferencias({ ...preferencias, presupuesto: Number(e.target.value)||0 })} className="w-full bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl pl-7 pr-4 py-3.5 font-extrabold text-[#142C50] outline-none focus:border-[#142C50]" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[10000,15000,25000].map(v=> (
                <button key={v} onClick={()=> setPreferencias({ ...preferencias, presupuesto: v })} className={`py-2 rounded-full text-xs font-extrabold border ${preferencias.presupuesto===v ? 'bg-[#142C50] text-white border-[#142C50]' : 'bg-white border-[#7D8A9A]/30 text-[#7D8A9A]'}`}>${v.toLocaleString('es-CL')}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 mt-4 pb-2">
          <div className="bg-white border border-[#7D8A9A]/30 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-[#142C50]">Intereses</h3>
            <p className="text-xs text-[#7D8A9A] mt-1 font-medium">Elige al menos uno para personalizar</p>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {categorias.map(cat=>{
                const activo=preferencias.intereses.includes(cat)
                const icons={'Museos':'🏛️','Gastronomía':'🍽️','Histórico':'🏰','Parques':'🌳','Shopping':'🛍️','Vida Nocturna':'🌃'}
                return (
                  <button key={cat} onClick={()=> toggleInteres(cat)} className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border text-sm font-extrabold text-left transition ${activo ? 'bg-[#142C50] text-white border-[#142C50] shadow' : 'bg-[#F4F0E6] border-[#7D8A9A]/30 text-[#7D8A9A]'}`}>
                    <span className={`w-8 h-8 rounded-full grid place-items-center text-sm ${activo ? 'bg-white/15' : 'bg-white border border-[#7D8A9A]/30'}`}>{icons[cat]}</span>
                    {cat}{activo && <span className="ml-auto">✓</span>}
                  </button>
                )
              })}
            </div>
            {errorForm && <p className="text-xs text-red-600 mt-2 font-bold">⚠ {errorForm}</p>}
          </div>
        </div>
      </div>
      {/* Botón fijo central - siempre visible sin scroll */}
      <div className="sticky bottom-0 bg-white border-t border-[#7D8A9A]/30 px-5 py-4 shadow-[0_-8px_24px_rgba(15,48,91,0.08)]">
        <button onClick={handleGenerar} disabled={loading} className="w-full max-w-sm mx-auto bg-[#E0A526] hover:brightness-95 disabled:bg-slate-300 text-[#142C50] font-extrabold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 transition block">
          {loading ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Generando tu ruta...</> : <>✨ Generar Ruta</>}
        </button>
        <p className="text-center text-xs text-[#7D8A9A] mt-2 font-medium">Solo verás lugares que encajan en tu tiempo y presupuesto.</p>
      </div>
    </motion.div>
  )
}
