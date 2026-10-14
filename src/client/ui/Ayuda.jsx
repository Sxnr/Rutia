import { motion } from 'framer-motion'

export default function Ayuda({ setPantalla }) {
  return (
    <motion.div key="ayuda" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
      <div className="bg-white border-b border-[#7D8A9A]/30 px-5 pt-6 pb-4">
        <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#142C50]">‹ Volver</button>
        <h1 className="text-lg font-extrabold text-[#142C50] mt-1">Ayuda</h1>
        <p className="text-sm text-[#7D8A9A]">Contacto y preguntas frecuentes</p>
      </div>
      <div className="px-5 mt-5 space-y-3">
        {[
          { q: "¿Cómo genera rutas con mi presupuesto?", a: "Descartamos automáticamente los lugares que exceden tu tiempo y presupuesto, mostrándote solo lo viable." },
          { q: "¿Funciona sin internet?", a: "Sí, guarda tu ruta y el checklist de visita sigue disponible offline." },
          { q: "¿De dónde salen los datos?", a: "Lugares reales de Santiago con precios y horarios actualizados." },
        ].map(f=> (
          <div key={f.q} className="bg-white border border-[#7D8A9A]/30 rounded-2xl p-4 shadow-sm">
            <p className="font-extrabold text-[#142C50] text-sm">{f.q}</p>
            <p className="text-xs text-[#7D8A9A] mt-1 leading-relaxed">{f.a}</p>
          </div>
        ))}
        <div className="bg-[#142C50] rounded-2xl p-4 text-white"><p className="font-extrabold text-sm">¿Aún necesitas ayuda?</p><p className="text-xs text-white/70 mt-1">soporte@rutia.cl • +56 9 1234 5678</p><button className="mt-3 bg-[#E0A526] text-[#142C50] font-extrabold px-4 py-2 rounded-full text-xs">Contactar</button></div>
      </div>
    </motion.div>
  )
}
