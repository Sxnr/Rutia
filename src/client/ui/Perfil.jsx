import { motion } from 'framer-motion'

export default function Perfil({ setPantalla, perfil }) {
  return (
    <motion.div key="perfil" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
      <div className="bg-white border-b border-[#7D8A9A]/30 px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#142C50] flex items-center gap-1">‹ Volver al inicio</button>
            <h1 className="text-lg font-extrabold text-[#142C50] mt-2">Mi Perfil</h1>
            <p className="text-sm text-[#7D8A9A]">Gestiona tu identidad exploradora</p>
          </div>
          <button onClick={()=> setPantalla('DATOS')} className="w-10 h-10 rounded-full bg-[#F4F0E6] border border-[#7D8A9A]/30 grid place-items-center text-[#142C50] text-lg" title="Configuración">⚙</button>
        </div>
      </div>
      <div className="px-5 mt-5">
        <div className="bg-white border border-[#7D8A9A]/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/100?img=12" className="w-14 h-14 rounded-full border-2 border-[#7D8A9A]/30" alt="avatar"/>
            <div><p className="font-extrabold text-[#142C50]">{perfil.nombre}</p></div>
          </div>
          <button onClick={() => setPantalla('DATOS')} className="mt-4 w-full bg-[#142C50] text-white font-extrabold py-3 rounded-full text-sm flex items-center justify-center gap-2"><span>⚙</span> Editar mis datos</button>
          <button className="mt-3 w-full bg-white border border-[#7D8A9A]/30 text-[#142C50] font-extrabold py-3 rounded-full text-sm">Ayuda y contacto</button>
          <button className="mt-3 w-full bg-white border border-[#7D8A9A]/30 text-[#142C50] font-extrabold py-3 rounded-full text-sm">Términos y condiciones</button>
          <button className="mt-3 w-full bg-white border border-[#7D8A9A]/30 text-[#142C50] font-extrabold py-3 rounded-full text-sm">Política y privacidad</button>

        </div>
      </div>
    </motion.div>
  )
}
