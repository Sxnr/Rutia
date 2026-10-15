import { motion } from 'framer-motion'

export default function EditarDatos({ setPantalla, perfil, setPerfil }) {
  return (
    <motion.div key="datos" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
      <div className="bg-white border-b border-[#7D8A9A]/30 px-5 pt-6 pb-4">
        <button onClick={()=> setPantalla('PERFIL')} className="text-xs font-bold text-[#142C50] flex items-center gap-1">‹ Volver al perfil</button>
        <h1 className="text-lg font-extrabold text-[#142C50] mt-2">Editar datos</h1>
        <p className="text-sm text-[#7D8A9A]">Configuración de tu cuenta. Se guarda al pulsar Guardar.</p>
      </div>
      <div className="px-5 mt-5">
        <div className="bg-white border border-[#7D8A9A]/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-[#F4F0E6] grid place-items-center text-xl">⚙</span>
            <div><p className="font-extrabold text-[#142C50]">Configuración</p><p className="text-xs text-[#7D8A9A]">Nombre de usuario, correo y contraseña</p></div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-bold text-[#142C50]">Nombre de usuario</label>
              <input value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} placeholder="Tu nombre" maxLength={40} className="mt-1 w-full bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-[#142C50] outline-none focus:border-[#142C50]" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#142C50]">Correo</label>
              <input value={perfil.correo} onChange={e => setPerfil({ ...perfil, correo: e.target.value })} placeholder="tu@correo.cl" maxLength={60} className="mt-1 w-full bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-[#142C50] outline-none focus:border-[#142C50]" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#142C50]">Nueva contraseña</label>
              <input type="password" value={perfil.password} onChange={e => setPerfil({ ...perfil, password: e.target.value })} placeholder="••••••••" maxLength={40} className="mt-1 w-full bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-[#142C50] outline-none focus:border-[#142C50]" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#142C50]">Confirmar contraseña</label>
              <input type="password" value={perfil.password2} onChange={e => setPerfil({ ...perfil, password2: e.target.value })} placeholder="Repite tu contraseña" maxLength={40} className="mt-1 w-full bg-[#F4F0E6] border border-[#7D8A9A]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-[#142C50] outline-none focus:border-[#142C50]" />
              {perfil.password2 && perfil.password !== perfil.password2 && <p className="text-xs text-red-600 font-bold mt-1">⚠ Las contraseñas no coinciden</p>}
            </div>
            <button onClick={() => setPantalla('PERFIL')} disabled={!perfil.nombre.trim() || !perfil.correo.trim() || (perfil.password || perfil.password2 ? perfil.password !== perfil.password2 || !perfil.password : false)} className="w-full bg-[#142C50] text-white font-extrabold py-3 rounded-full text-sm disabled:opacity-40">Guardar datos</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
