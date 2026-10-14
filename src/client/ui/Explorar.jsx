import { motion } from 'framer-motion'
import rutiaIcon from '../../assets/rutia-icon.svg'
import { poisCollection } from '../../server/data/db/poisCollection.js'
import { IconSearch, IconCrearRuta } from './icons.jsx'

const filtrosRapidos = ['Todos', 'Museos', 'Gastronomía', 'Parques']

export default function Explorar({ perfil, idioma, setIdioma, filtroActivo, setFiltroActivo, setPantalla }) {
  return (
    <motion.div key="HOME" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="pb-28">
      <div className="px-5 pt-6 pb-2 flex items-center justify-between bg-white border-b border-[#7D8A9A]/30">
        <div className="flex items-center gap-3">
          <img src={rutiaIcon} alt="Rutia" className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
          <div>
            <h1 className="text-[17px] font-extrabold leading-none text-[#142C50] tracking-tight">Rutia</h1>
            <p className="text-[11px] text-[#7D8A9A] font-medium mt-0.5">Hola, {perfil.nombre} · ¿A dónde vamos hoy?</p>
          </div>
        </div>
        <button onClick={() => setIdioma(idioma === 'ES' ? 'EN' : 'ES')} className="px-3 h-10 rounded-full bg-white border border-[#7D8A9A]/30 grid place-items-center shadow-sm text-[#142C50] text-xs font-extrabold" title="Cambiar idioma">{idioma === 'ES' ? 'ES | EN' : 'EN | ES'}</button>
      </div>
      <div className="px-5 mt-4">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[#7D8A9A]/30 shadow-sm">
          <span className="text-[#7D8A9A]"><IconSearch /></span>
          <input disabled placeholder="¿Qué quieres explorar hoy?" className="bg-transparent outline-none text-sm placeholder:text-[#7D8A9A] w-full font-medium text-[#142C50]" />
          <span className="w-8 h-8 rounded-full bg-[#F4F0E6] grid place-items-center border border-[#7D8A9A]/30 text-[#142C50] text-sm">⚙</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar px-5 pb-1">
        {filtrosRapidos.map(f => (
          <button key={f} onClick={() => setFiltroActivo(f)} className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold border transition flex items-center gap-1.5 ${filtroActivo===f ? 'bg-[#142C50] text-white border-[#142C50] shadow' : 'bg-white border-[#7D8A9A]/30 text-[#7D8A9A]'}`}>{f==='Museos' && <span>🏛️</span>} {f}</button>
        ))}
      </div>
      {/* BOTÓN PRINCIPAL - azul, bien visible, arriba */}
      <div className="px-5 mt-5">
        <button onClick={() => setPantalla('FORM')} className="w-full bg-[#E0A526] hover:brightness-95 text-[#142C50] font-extrabold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 text-sm">
          <span className="w-7 h-7 rounded-full bg-[#142C50]/15 grid place-items-center"><IconCrearRuta/></span>
          Planifica tu ruta inteligente →
        </button>
        <p className="text-center text-xs text-[#7D8A9A] mt-2 font-medium">Dinos tu tiempo y presupuesto. Nosotros armamos lo imposible.</p>
      </div>
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-[#142C50] text-[16px]">Lugares disponibles en la app</h3>
        </div>
        <p className="text-xs text-[#7D8A9A] mt-1 font-medium">Desliza para ver más lugares</p>
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
          {poisCollection.slice(0, 6).map(lugar => (
            <div key={lugar.id} className="flex-shrink-0 w-40 rounded-[18px] overflow-hidden border border-[#7D8A9A]/30 bg-white shadow-sm">
              <img src={lugar.imagen} alt={lugar.nombre} className="h-24 w-full object-cover" />
              <div className="p-3">
                <p className="text-xs font-extrabold text-[#142C50] leading-tight line-clamp-2 min-h-[28px]">{lugar.nombre}</p>
                <p className="text-[11px] text-[#7D8A9A] font-medium mt-1">{lugar.categoria}</p>
                <p className="text-[11px] font-extrabold text-[#142C50] mt-0.5">{lugar.costo === 0 ? "Gratis" : `$${lugar.costo.toLocaleString('es-CL')}`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
