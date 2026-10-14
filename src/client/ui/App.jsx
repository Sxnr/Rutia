import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouteStore } from '../state/store.jsx'
import { validarPreferencias } from '../../server/presentation/routeSchema.js'
import { IconExplorar, IconCrearRuta, IconBookmark } from './icons.jsx'

import Explorar from './Explorar.jsx'
import Preferencias from './Preferencias.jsx'
import RutaSugerida from './RutaSugerida.jsx'
import Guardados from './Guardados.jsx'
import DetalleLugar from './DetalleLugar.jsx'
import Perfil from './Perfil.jsx'
import EditarDatos from './EditarDatos.jsx'
import Ayuda from './Ayuda.jsx'

// Datos UI (huérfanos, pendientes de limpieza en Fase 2+)
const rutasPopularesUI = [
  {
    id: "r_santiago_historico",
    titulo: "Santiago Histórico",
    duracion: "3h 45m",
    rating: 4.8,
    reviews: 342,
    precio: "$4.500",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Plaza_de_Armas_Santiago_Chile.jpg?width=800",
    fallback: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop",
    lugares: ["Plaza de Armas", "Palacio La Moneda", "Catedral Metropolitana"],
  },
  {
    id: "r_bellavista",
    titulo: "Bohemio Bellavista",
    duracion: "2h 30m",
    rating: 4.9,
    reviews: 189,
    precio: "$12.000",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/La_Chascona.jpg?width=800",
    fallback: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
    lugares: ["La Chascona", "Patio Bellavista", "Cerro San Cristóbal"],
  },
  {
    id: "r_parques",
    titulo: "Parques & Arte",
    duracion: "4h 10m",
    rating: 4.7,
    reviews: 210,
    precio: "$7.000",
    imagen: "https://images.unsplash.com/photo-1540202404-a2f29016b523?q=80&w=800&auto=format&fit=crop",
    fallback: "https://images.unsplash.com/photo-1555993539-1732b0258235?q=80&w=800&auto=format&fit=crop",
    lugares: ["Parque Forestal", "Bellas Artes", "GAM"],
  },
]

const imagenLastarriaReal = "https://commons.wikimedia.org/wiki/Special:FilePath/Jose%20Victorino%20Lastarria.jpg?width=800"
const fallbackLastarria = "https://images.unsplash.com/photo-1519662978799-67fa9b6d5b3b?q=80&w=800&auto=format&fit=crop"

export default function App() {
  const [pantalla, setPantalla] = useState('HOME')
  const [filtroActivo, setFiltroActivo] = useState('Todos')
  const [poiFicha, setPoiFicha] = useState(null)
  const [errorForm, setErrorForm] = useState(null)
  const [visitados, setVisitados] = useState(new Set())
  const [idioma, setIdioma] = useState('ES')
  const [perfil, setPerfil] = useState({ nombre: 'Usuario', correo: 'usuario@gmail.com', password: '', password2: '' })
  const [tituloEditando, setTituloEditando] = useState(false)
  const [tituloTemp, setTituloTemp] = useState('')
  const [guardadosTab, setGuardadosTab] = useState('rutas')

  const { preferencias, setPreferencias, itinerario, setItinerario, generarRuta, guardarRuta, rutaGuardada, cargarPoi, loading, reordenarParadas } = useRouteStore()

  useEffect(() => {
    if (itinerario) setVisitados(new Set())
  }, [itinerario?.titulo])

  const toggleInteres = (cat) => {
    const nuevos = preferencias.intereses.includes(cat) ? preferencias.intereses.filter(c => c !== cat) : [...preferencias.intereses, cat]
    setPreferencias({ ...preferencias, intereses: nuevos })
    setErrorForm(null)
  }

  const toggleVisitado = (id) => {
    setVisitados(prev => {
      const ns = new Set(prev)
      if (ns.has(id)) ns.delete(id)
      else ns.add(id)
      return ns
    })
  }

  const handleEliminarParada = (id) => {
    if (!itinerario) return
    const nuevas = itinerario.paradas.filter(p => p.id !== id)
    // Recalcula totales simple
    const costoTotal = nuevas.reduce((s,p)=> s + (p.costo||0), 0)
    const tiempoTotal = nuevas.reduce((s,p)=> s + (p.tiempoMin||0), 0)
    setItinerario({
      ...itinerario,
      paradas: nuevas,
      costoTotal: `$${costoTotal.toLocaleString('es-CL')}`,
      duracionTotal: `${Math.floor(tiempoTotal/60)}h ${String(tiempoTotal%60).padStart(2,'0')}m`,
      distancia: nuevas.length <=1 ? "—" : `${(nuevas.length*0.6).toFixed(1)} km a pie`
    })
    // also remove from visitados
    setVisitados(prev => { const ns=new Set(prev); ns.delete(id); return ns })
  }

  const handleGenerar = async () => {
    const res = validarPreferencias(preferencias)
    if (!res.success) {
      setErrorForm(res.error.issues[0]?.message || "Revisa formulario")
      return
    }
    try {
      await generarRuta(preferencias)
      setPantalla('RUTA')
    } catch (e) {
      setErrorForm(e.message)
    }
  }

  const handleGuardar = () => {
    guardarRuta()
    setPantalla('GUARDADA')
  }

  const abrirFichaPoi = async (poi) => {
    setPoiFicha(poi)
    try { await cargarPoi(poi.id) } catch {}
    setPantalla('POI')
  }

  return (
    <div className="min-h-screen bg-[#142C50] flex justify-center py-4 px-2 md:py-6">
      <div className="w-full max-w-md mx-auto bg-[#F4F0E6] h-[844px] md:h-[860px] shadow-xl rounded-[32px] overflow-hidden relative flex flex-col border border-white/20">
        <div className="flex-1 overflow-y-auto no-scrollbar relative bg-[#F4F0E6]">
          <AnimatePresence mode="wait">
            {pantalla === 'HOME' && (
              <Explorar perfil={perfil} idioma={idioma} setIdioma={setIdioma} filtroActivo={filtroActivo} setFiltroActivo={setFiltroActivo} setPantalla={setPantalla} />
            )}
            {pantalla==='PERFIL' && (
              <Perfil setPantalla={setPantalla} perfil={perfil} />
            )}
            {pantalla==='DATOS' && (
              <EditarDatos setPantalla={setPantalla} perfil={perfil} setPerfil={setPerfil} />
            )}
            {pantalla==='FORM' && (
              <Preferencias setPantalla={setPantalla} preferencias={preferencias} setPreferencias={setPreferencias} toggleInteres={toggleInteres} errorForm={errorForm} handleGenerar={handleGenerar} loading={loading} />
            )}
            {pantalla==='RUTA' && (
              <RutaSugerida itinerario={itinerario} setItinerario={setItinerario} setPantalla={setPantalla} handleGuardar={handleGuardar} tituloEditando={tituloEditando} setTituloEditando={setTituloEditando} tituloTemp={tituloTemp} setTituloTemp={setTituloTemp} visitados={visitados} toggleVisitado={toggleVisitado} reordenarParadas={reordenarParadas} handleEliminarParada={handleEliminarParada} abrirFichaPoi={abrirFichaPoi} />
            )}
            {(pantalla==='MISRUTAS' || pantalla==='GUARDADA') && (
              <Guardados setPantalla={setPantalla} guardadosTab={guardadosTab} setGuardadosTab={setGuardadosTab} rutaGuardada={rutaGuardada} visitados={visitados} toggleVisitado={toggleVisitado} reordenarParadas={reordenarParadas} abrirFichaPoi={abrirFichaPoi} />
            )}
            {pantalla==='POI' && poiFicha && (
              <DetalleLugar poiFicha={poiFicha} setPantalla={setPantalla} visitados={visitados} toggleVisitado={toggleVisitado} />
            )}
            {pantalla==='AYUDA' && (
              <Ayuda setPantalla={setPantalla} />
            )}
          </AnimatePresence>
        </div>

        {/* NAVBAR - simbología mejorada - oculto en FORM para dejar botón Generar central */}
        {pantalla !== 'FORM' && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#7D8A9A]/30 px-6 pt-2 pb-4 rounded-t-3xl shadow-[0_-8px_24px_rgba(15,48,91,0.08)]">
          <div className="flex items-center justify-between">
            {[
              { id: 'HOME', label: 'Explorar', icon: <IconExplorar/>, go: 'HOME' },
              { id: 'FORM', label: 'Crear Ruta', icon: <IconCrearRuta/>, go: 'FORM' },
              { id: 'MISRUTAS', label: 'Guardados', icon: <IconBookmark/>, go: 'MISRUTAS' },
              { id: 'PERFIL', label: 'Perfil', icon: <span className="text-lg">👤</span>, go: 'PERFIL' },
            ].map(item => {
              const active = (pantalla==='HOME' && item.id==='HOME') || (pantalla==='FORM' && item.id==='FORM') || (pantalla==='RUTA' && item.id==='FORM') || ((pantalla==='MISRUTAS' || pantalla==='GUARDADA') && item.id==='MISRUTAS') || ((pantalla==='PERFIL' || pantalla==='DATOS') && item.id==='PERFIL')
              return (
                <button key={item.id} onClick={()=> setPantalla(item.go)} className={`flex flex-col items-center gap-1 min-w-[64px] ${active ? 'text-[#142C50]' : 'text-[#7D8A9A]'}`}>
                  <span className={`w-7 h-7 grid place-items-center rounded-full ${active ? 'bg-[#F4F0E6]' : ''}`}>{item.icon}</span>
                  <span className="text-[11px] font-extrabold leading-none">{item.label}</span>
                </button>
              )
            })}
          </div>
          <div className="w-24 h-1 bg-[#142C50] rounded-full mx-auto mt-3" />
        </div>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#142C50]/60 backdrop-blur-sm grid place-items-center z-50">
              <div className="bg-white border border-[#7D8A9A]/30 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 mx-8">
                <span className="w-10 h-10 border-3 border-[#7D8A9A]/30 border-t-[#142C50] rounded-full animate-spin" style={{ borderWidth: 3 }} />
                <p className="font-extrabold text-[#142C50] text-sm">Generando tu ruta...</p>
                <p className="text-xs text-[#7D8A9A] text-center font-medium">Filtrando lugares según tu presupuesto y tiempo</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
