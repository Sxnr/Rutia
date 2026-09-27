import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouteStore } from './state/store.jsx'
import { validarPreferencias } from './schemas/routeSchema.js'
import { poisCollection } from './data/poisCollection.js'

// Datos UI con fotos reales de Santiago
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

// Lista adicional hardcodeada para agregar lugares propios (solo campos del esquema pois)
const lugaresExtra = [
  { id: "extra_mercado", nombre: "Mercado Central", categoria: "Gastronomía", costo: 8000, tiempoMin: 60, horario: "Lun-Dom 09:00-18:00", imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop" },
  { id: "extra_costanera", nombre: "Sky Costanera", categoria: "Parques", costo: 15000, tiempoMin: 60, horario: "Lun-Dom 10:00-22:00", imagen: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=400&auto=format&fit=crop" },
  { id: "extra_sancristobal", nombre: "Cerro San Cristóbal", categoria: "Parques", costo: 0, tiempoMin: 90, horario: "Lun-Dom 09:00-19:00", imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop" },
]

const lugaresVisitadosEjemplo = [
  { id: "vis_bellas", nombre: "Museo Nacional de Bellas Artes", categoria: "Museos", costo: 0, tiempoMin: 60, horario: "Mar-Dom 10:00-18:30", imagen: "https://images.unsplash.com/photo-1540202404-a2f29016b523?q=80&w=400&auto=format&fit=crop" },
  { id: "vis_plaza", nombre: "Plaza de Armas", categoria: "Histórico", costo: 0, tiempoMin: 30, horario: "Lun-Dom 06:00-22:00", imagen: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=400&auto=format&fit=crop" },
  { id: "vis_emporio", nombre: "Emporio La Rosa", categoria: "Gastronomía", costo: 4500, tiempoMin: 40, horario: "Lun-Dom 08:00-21:00", imagen: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=400&auto=format&fit=crop" },
]

// Iconos mejorados - no confundibles con Gemini
const IconBell = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7-6 5-6 9a1.5 1.5 0 0 1-3 0c0-4-3-2-3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>)
const IconSearch = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>)
const IconStar = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="#FFC727" stroke="#FFC727"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)
const IconClock = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)
// Nuevo: Explorar = Brújula
const IconExplorar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.08 20.26 12 17.5 9.92 20.26 7.76 7.76 12 10.5 16.24 7.76" fill="currentColor" stroke="none" opacity="0.9"/>
    <circle cx="12" cy="12" r="2" fill="white" stroke="currentColor"/>
  </svg>
)
// Nuevo: Crear Ruta = Mapa con pin y ruta
const IconCrearRuta = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <path d="M8 2 v16 M16 6 v16" strokeWidth="1.2"/>
    <circle cx="12" cy="11" r="2.5" fill="#FFC727" stroke="#0F305B" strokeWidth="1.2"/>
    <path d="M12 13.5 L12 16" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6 M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
)
const IconBookmark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
)

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

export default function App() {
  const [pantalla, setPantalla] = useState('HOME')
  const [filtroActivo, setFiltroActivo] = useState('Todos')
  const [poiFicha, setPoiFicha] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(35)
  const [errorForm, setErrorForm] = useState(null)
  const [visitados, setVisitados] = useState(new Set())
  // Reseñas: { [poiId]: [{rating, comentario, fecha}] }
  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [errorResena, setErrorResena] = useState(null)
  const [reviews, setReviews] = useState({})
  const [idioma, setIdioma] = useState('ES')
  const [perfil, setPerfil] = useState({ nombre: 'Usuario', correo: 'usuario@gmail.com' })
  const [tituloEditando, setTituloEditando] = useState(false)
  const [tituloTemp, setTituloTemp] = useState('')
  const [guardadosTab, setGuardadosTab] = useState('rutas')
  const [lugarExtraId, setLugarExtraId] = useState('')

  const { preferencias, setPreferencias, itinerario, setItinerario, generarRuta, guardarRuta, rutaGuardada, cargarPoi, loading, reordenarParadas } = useRouteStore()

  const categorias = ['Museos', 'Gastronomía', 'Histórico', 'Parques', 'Shopping', 'Vida Nocturna']
  const filtrosRapidos = ['Todos', 'Museos', 'Gastronomía', 'Parques']

  useEffect(() => {
    if (!audioPlaying) return
    const id = setInterval(() => setAudioProgress(p => (p < 100 ? p + 0.5 : 0)), 200)
    return () => clearInterval(id)
  }, [audioPlaying])

  useEffect(() => {
    if (itinerario) setVisitados(new Set())
  }, [itinerario?.titulo])

  // Reset reseña al cambiar de POI
  useEffect(() => {
    setRating(0)
    setComentario("")
    setErrorResena(null)
  }, [poiFicha?.id])

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

  const handleEnviarResena = () => {
    if (rating === 0) { setErrorResena("Elige de 1 a 5 estrellas"); return }
    if (comentario.trim().length < 10) { setErrorResena("Comentario obligatorio: mínimo 10 caracteres"); return }
    const nueva = { rating, comentario: comentario.trim(), fecha: new Date().toLocaleDateString('es-CL'), autor: "Tú" }
    setReviews(prev => ({
      ...prev,
      [poiFicha.id]: [...(prev[poiFicha.id]||[]), nueva]
    }))
    setRating(0); setComentario(""); setErrorResena(null)
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

  const handleAgregarLugarPropio = () => {
    if (!lugarExtraId || !itinerario) return
    const elegido = lugaresExtra.find(l => l.id === lugarExtraId)
    if (!elegido) return
    if (itinerario.paradas.some(p => p.id === elegido.id)) { setLugarExtraId(''); return }
    const nuevaParada = {
      ...elegido,
      costoLabel: elegido.costo === 0 ? "$0 (Gratis)" : `$${elegido.costo.toLocaleString('es-CL')}`,
      hora: "Horario libre",
      orden: itinerario.paradas.length + 1,
    }
    const nuevas = [...itinerario.paradas, nuevaParada]
    const costoTotal = nuevas.reduce((s, p) => s + (p.costo || 0), 0)
    const tiempoTotal = nuevas.reduce((s, p) => s + (p.tiempoMin || 0), 0)
    setItinerario({
      ...itinerario,
      paradas: nuevas,
      costoTotal: `$${costoTotal.toLocaleString('es-CL')}`,
      duracionTotal: `${Math.floor(tiempoTotal / 60)}h ${String(tiempoTotal % 60).padStart(2, '0')}m`,
    })
    setLugarExtraId('')
  }

  const abrirFichaPoi = async (poi) => {
    setPoiFicha(poi)
    try { await cargarPoi(poi.id) } catch {}
    setPantalla('POI')
  }

  const progreso = itinerario ? Math.round((visitados.size / (itinerario.paradas?.length || 1)) * 100) : 0

  const getDatoAmigable = (id) => datosAmigables[id] || datosAmigables["default"]

  return (
    <div className="min-h-screen bg-[#0A2540] flex justify-center py-4 px-2 md:py-6">
      <div className="w-full max-w-md mx-auto bg-[#F8FAFC] h-[844px] md:h-[860px] shadow-xl rounded-[32px] overflow-hidden relative flex flex-col border border-white/20">
        <div className="flex-1 overflow-y-auto no-scrollbar relative bg-[#F8FAFC]">
          <AnimatePresence mode="wait">
            {/* HOME */}
            {pantalla === 'HOME' && (
              <motion.div key="HOME" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="pb-28">
                <div className="px-5 pt-6 pb-2 flex items-center justify-between bg-white border-b border-[#E6EEF7]">
                  <div className="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/100?img=12" alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#E6EEF7]" />
                    <div>
                      <h1 className="text-[15px] font-extrabold leading-none text-[#0F305B]">Hola, {perfil.nombre}</h1>
                      <p className="text-[11px] text-[#5A7896] font-medium mt-0.5">¿A dónde vamos hoy?</p>
                    </div>
                  </div>
                  <button onClick={() => setIdioma(idioma === 'ES' ? 'EN' : 'ES')} className="px-3 h-10 rounded-full bg-white border border-[#E6EEF7] grid place-items-center shadow-sm text-[#0F305B] text-xs font-extrabold" title="Cambiar idioma">{idioma === 'ES' ? 'ES | EN' : 'EN | ES'}</button>
                </div>
                <div className="px-5 mt-4">
                  <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[#E6EEF7] shadow-sm">
                    <span className="text-[#8AA0B8]"><IconSearch /></span>
                    <input disabled placeholder="¿Qué quieres explorar hoy?" className="bg-transparent outline-none text-sm placeholder:text-[#8AA0B8] w-full font-medium text-[#0F305B]" />
                    <span className="w-8 h-8 rounded-full bg-[#F1F5F9] grid place-items-center border border-[#E6EEF7] text-[#0F305B] text-sm">⚙</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar px-5 pb-1">
                  {filtrosRapidos.map(f => (
                    <button key={f} onClick={() => setFiltroActivo(f)} className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold border transition flex items-center gap-1.5 ${filtroActivo===f ? 'bg-[#0F305B] text-white border-[#0F305B] shadow' : 'bg-white border-[#E6EEF7] text-[#3A5A7A]'}`}>{f==='Museos' && <span>🏛️</span>} {f}</button>
                  ))}
                </div>
                {/* BOTÓN PRINCIPAL - azul, bien visible, arriba */}
                <div className="px-5 mt-5">
                  <button onClick={() => setPantalla('FORM')} className="w-full bg-[#0F305B] hover:bg-[#0A2540] text-white font-extrabold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 text-sm">
                    <span className="w-7 h-7 rounded-full bg-white/20 grid place-items-center"><IconCrearRuta/></span>
                    Planifica tu ruta inteligente →
                  </button>
                  <p className="text-center text-xs text-[#5A7896] mt-2 font-medium">Dinos tu tiempo y presupuesto. Nosotros armamos lo imposible.</p>
                </div>
                <div className="px-5 mt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-[#0F305B] text-[16px]">Lugares disponibles en la app</h3>
                  </div>
                  <p className="text-xs text-[#5A7896] mt-1 font-medium">Desliza para ver más lugares</p>
                  <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
                    {poisCollection.slice(0, 6).map(lugar => (
                      <div key={lugar.id} className="flex-shrink-0 w-40 rounded-[18px] overflow-hidden border border-[#E6EEF7] bg-white shadow-sm">
                        <img src={lugar.imagen} alt={lugar.nombre} className="h-24 w-full object-cover" />
                        <div className="p-3">
                          <p className="text-xs font-extrabold text-[#0F305B] leading-tight line-clamp-2 min-h-[28px]">{lugar.nombre}</p>
                          <p className="text-[11px] text-[#5A7896] font-medium mt-1">{lugar.categoria}</p>
                          <p className="text-[11px] font-extrabold text-[#0F305B] mt-0.5">{lugar.costo === 0 ? "Gratis" : `$${lugar.costo.toLocaleString('es-CL')}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PERFIL */}
            {(pantalla==='PERFIL' || pantalla==='DATOS') && (
              <motion.div key="perfil" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
                <div className="bg-white border-b border-[#E6EEF7] px-5 pt-6 pb-4">
                  <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#0F305B] flex items-center gap-1">‹ Volver al inicio</button>
                  <h1 className="text-lg font-extrabold text-[#0F305B] mt-2">Mi Perfil</h1>
                  <p className="text-sm text-[#5A7896]">Gestiona tu identidad exploradora</p>
                </div>
                <div className="px-5 mt-5">
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src="https://i.pravatar.cc/100?img=12" className="w-14 h-14 rounded-full border-2 border-[#E6EEF7]" alt="avatar"/>
                      <div><p className="font-extrabold text-[#0F305B]">Usuario</p><p className="text-xs text-[#5A7896]">usuario@gmail.com</p><p className="text-xs text-[#5A7896]">Explorador nivel 3 • 12 rutas completadas</p></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3"><p className="font-bold text-[#0F305B]">Presupuesto favorito</p><p className="text-[#5A7896]">${preferencias.presupuesto.toLocaleString('es-CL')} CLP</p></div>
                      <div className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3"><p className="font-bold text-[#0F305B]">Tiempo medio</p><p className="text-[#5A7896]">{preferencias.tiempo}h</p></div>
                    </div>
                    <div className="mt-4 bg-[#F1F5F9] border border-[#E6EEF7] rounded-xl p-3">
                      <p className="text-xs font-extrabold text-[#0F305B]">Tu progreso</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white border border-[#E6EEF7] rounded-full overflow-hidden"><div className="h-full bg-[#0F305B] rounded-full" style={{ width: rutaGuardada ? "75%" : "30%" }}/></div>
                        <span className="text-xs font-bold text-[#0F305B]">{rutaGuardada ? "3/4" : "0/4"} rutas</span>
                      </div>
                      <p className="text-xs text-[#5A7896] mt-1">{rutaGuardada ? "¡Ruta guardada! Sigue explorando para subir de nivel." : "Genera tu primera ruta para empezar."}</p>
                    </div>
                    <button onClick={() => setPantalla(pantalla==='DATOS'?'PERFIL':'DATOS')} className="mt-4 w-full bg-[#0F305B] text-white font-extrabold py-3 rounded-full text-sm">{pantalla==='DATOS' ? 'Cerrar' : 'Editar mis datos'}</button>
                  </div>
                  {pantalla==='DATOS' && (
                    <div className="mt-4 bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-[#0F305B]">Datos editables</p>
                      <p className="text-xs text-[#5A7896] mt-1">Formulario conectado a la colección de usuarios. Cambios se reflejan en tus preferencias de ruta.</p>
                      <div className="mt-3 space-y-2">
                        <input placeholder="Nombre" defaultValue="Usuario" className="w-full bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F305B] outline-none focus:border-[#0F305B]" />
                        <input placeholder="Correo" defaultValue="usuario@gmail.com" className="w-full bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F305B] outline-none focus:border-[#0F305B]" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* FORMULARIO - con botón central fijo sin necesidad de scroll */}
            {pantalla==='FORM' && (
              <motion.div key="form" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="flex flex-col h-[calc(100%-0px)] bg-[#F8FAFC]">
                <div className="flex-1 overflow-y-auto pb-2">
                  <div className="bg-white border-b border-[#E6EEF7] px-5 pt-6 pb-4">
                    <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#0F305B]">‹ Volver</button>
                    <h1 className="text-lg font-extrabold text-[#0F305B] mt-1">Preferencias</h1>
                    <p className="text-sm text-[#5A7896] font-medium">Ajusta tus restricciones. Te mostramos solo lo viable.</p>
                  </div>
                  <div className="px-5 mt-5">
                    <div className="bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-[#0F305B] flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-[#E6EEF7] grid place-items-center text-sm border border-[#D6E3F3]">⏱</span> Tiempo disponible</h3>
                        <span className="bg-[#0F305B] text-white text-sm font-extrabold px-3 py-1.5 rounded-full">{preferencias.tiempo}h</span>
                      </div>
                      <input type="range" min="1" max="8" step="0.5" value={preferencias.tiempo} onChange={e=> setPreferencias({ ...preferencias, tiempo: parseFloat(e.target.value)})} className="w-full mt-5" />
                      <div className="flex justify-between text-xs text-[#5A7896] mt-1 font-bold"><span>1h</span><span>4h</span><span>8h</span></div>
                    </div>
                  </div>
                  <div className="px-5 mt-4">
                    <div className="bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                      <h3 className="font-extrabold text-[#0F305B] flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-[#ECFDF5] grid place-items-center text-sm border border-[#D1FAE5]">💰</span> Presupuesto total (CLP)</h3>
                      <div className="mt-4 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7896] font-bold">$</span>
                        <input type="number" value={preferencias.presupuesto} onChange={e=> setPreferencias({ ...preferencias, presupuesto: Number(e.target.value)||0 })} className="w-full bg-[#F1F5F9] border border-[#E6EEF7] rounded-xl pl-7 pr-4 py-3.5 font-extrabold text-[#0F305B] outline-none focus:border-[#0F305B]" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[10000,15000,25000].map(v=> (
                          <button key={v} onClick={()=> setPreferencias({ ...preferencias, presupuesto: v })} className={`py-2 rounded-full text-xs font-extrabold border ${preferencias.presupuesto===v ? 'bg-[#0F305B] text-white border-[#0F305B]' : 'bg-white border-[#E6EEF7] text-[#3A5A7A]'}`}>${v.toLocaleString('es-CL')}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 mt-4 pb-2">
                    <div className="bg-white border border-[#E6EEF7] rounded-2xl p-5 shadow-sm">
                      <h3 className="font-extrabold text-[#0F305B]">Intereses</h3>
                      <p className="text-xs text-[#5A7896] mt-1 font-medium">Elige al menos uno para personalizar</p>
                      <div className="grid grid-cols-2 gap-2.5 mt-4">
                        {categorias.map(cat=>{
                          const activo=preferencias.intereses.includes(cat)
                          const icons={'Museos':'🏛️','Gastronomía':'🍽️','Histórico':'🏰','Parques':'🌳','Shopping':'🛍️','Vida Nocturna':'🌃'}
                          return (
                            <button key={cat} onClick={()=> toggleInteres(cat)} className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border text-sm font-extrabold text-left transition ${activo ? 'bg-[#0F305B] text-white border-[#0F305B] shadow' : 'bg-[#F8FAFC] border-[#E6EEF7] text-[#3A5A7A]'}`}>
                              <span className={`w-8 h-8 rounded-full grid place-items-center text-sm ${activo ? 'bg-white/15' : 'bg-white border border-[#E6EEF7]'}`}>{icons[cat]}</span>
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
                <div className="sticky bottom-0 bg-white border-t border-[#E6EEF7] px-5 py-4 shadow-[0_-8px_24px_rgba(15,48,91,0.08)]">
                  <button onClick={handleGenerar} disabled={loading} className="w-full max-w-sm mx-auto bg-[#0F305B] hover:bg-[#0A2540] disabled:bg-slate-300 text-white font-extrabold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 transition block">
                    {loading ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Generando tu ruta...</> : <>✨ Generar Ruta</>}
                  </button>
                  <p className="text-center text-xs text-[#5A7896] mt-2 font-medium">Solo verás lugares que encajan en tu tiempo y presupuesto.</p>
                </div>
              </motion.div>
            )}

            {/* RUTA SUGERIDA - con CHECKLIST + ELIMINAR */}
            {pantalla==='RUTA' && (
              <motion.div key="ruta" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="pb-36 bg-[#F8FAFC]">
                <div className="relative h-[264px] w-full overflow-hidden">
                  <img src={itinerario?.paradas?.[0]?.imagen || "https://commons.wikimedia.org/wiki/Special:FilePath/Museo%20Nacional%20de%20Bellas%20Artes%20Santiago.jpg?width=1200"} alt="Ruta" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/85 via-[#0A2540]/35 to-[#0A2540]/10" />
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
                    <button onClick={()=> setPantalla('HOME')} className="bg-white px-4 py-2 rounded-full text-[13px] font-extrabold shadow-md text-[#0F305B] flex items-center gap-1.5 border border-white leading-none"><span className="text-[16px]">‹</span> Santiago Inteligente</button>
                    <button onClick={handleGuardar} className="w-9 h-9 rounded-full bg-[#FFC727] grid place-items-center shadow-md text-[#0F305B] border border-white">♡</button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
                    <p className="text-[11px] font-extrabold tracking-widest uppercase text-white/80">Ruta sugerida</p>
                    <div className="inline-flex items-center bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-[#0F305B] shadow border border-white gap-1.5 mt-1.5">
                      <span>{itinerario?.duracionTotal || "3h 15m"}</span><span className="w-1 h-1 bg-[#8AA0B8] rounded-full"/><span>{itinerario?.costoTotal || "$8.500"}</span>
                    </div>
                    {tituloEditando ? (
                      <div className="mt-2 flex gap-2">
                        <input value={tituloTemp} onChange={e => setTituloTemp(e.target.value)} maxLength={60} placeholder="Nombre de tu ruta" className="flex-1 bg-white text-[#0F305B] text-sm font-bold rounded-xl px-3 py-2 outline-none" autoFocus />
                        <button onClick={() => { if (tituloTemp.trim() && itinerario) setItinerario({ ...itinerario, titulo: tituloTemp.trim() }); setTituloEditando(false) }} className="bg-[#FFC727] text-[#0F305B] text-xs font-extrabold px-3 py-2 rounded-xl">Guardar</button>
                      </div>
                    ) : (
                      <button onClick={() => { setTituloTemp(itinerario?.titulo || ''); setTituloEditando(true) }} className="block text-left w-full group" title="Toca para editar el nombre">
                        <h1 className="text-[20px] font-extrabold leading-tight mt-2 text-white drop-shadow-md">{itinerario?.titulo || "Ruta Bellas Artes & Forestal"} <span className="text-sm opacity-70">✏️</span></h1>
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-5 mt-6">
                  <h3 className="font-extrabold text-[#0F305B]">Tu itinerario</h3>
                  <p className="text-xs text-[#5A7896] mt-1 font-medium">Toca el checkbox al visitar y <span className="inline-flex align-middle w-4 h-4 rounded-full bg-white border border-[#FECACA] text-red-500 items-center justify-center mx-1"><IconTrash/></span> para quitar lugares.</p>
                  <div className="mt-4 space-y-3">
                    {(itinerario?.paradas || []).map((p,i)=> {
                      const hecho = visitados.has(p.id)
                      return (
                        <div key={p.id || p.nombre} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <label className={`w-8 h-8 rounded-full grid place-items-center text-xs font-extrabold border-2 cursor-pointer transition ${hecho ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-[#3A5A7A] border-[#E6EEF7] hover:border-[#0F305B]'}`}>
                              <input type="checkbox" checked={hecho} onChange={()=> toggleVisitado(p.id)} className="sr-only" />
                              {hecho ? '✓' : i+1}
                            </label>
                            {i < (itinerario?.paradas?.length-1) && <div className={`w-0.5 flex-1 mt-1 ${hecho ? 'bg-emerald-200' : 'bg-[#E6EEF7]'}`} style={{ minHeight: 32 }}/>}
                          </div>
                          <div className={`flex-1 border rounded-2xl p-3 flex gap-3 shadow-sm text-left transition relative ${hecho ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#E6EEF7] hover:border-[#0F305B]'}`}>
                            <button onClick={()=> abrirFichaPoi(p)} className="flex gap-3 flex-1 text-left min-w-0">
                              <img src={p.imagen} alt={p.nombre} onError={(e)=>{ if(p.fallback && e.currentTarget.src!==p.fallback) e.currentTarget.src=p.fallback }} className={`w-16 h-16 rounded-xl object-cover border flex-shrink-0 ${hecho ? 'border-emerald-200 opacity-70' : 'border-[#E6EEF7]'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-extrabold leading-tight truncate ${hecho ? 'text-emerald-700 line-through' : 'text-[#0F305B]'}`}>{p.nombre}</p>
                                <p className="text-xs text-[#5A7896] mt-0.5 font-medium">{p.hora}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${hecho ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-[#E6EEF7] text-[#0F305B] border-[#D6E3F3]'}`}>{hecho ? 'Visitado' : p.costoLabel}</span>
                                </div>
                              </div>
                            </button>
                            <div className="flex flex-col gap-1 flex-shrink-0 self-center">
                              <button onClick={()=> reordenarParadas(i, i - 1)} disabled={i === 0} className="w-8 h-7 rounded-full bg-white border border-[#E6EEF7] text-[#0F305B] grid place-items-center text-xs disabled:opacity-30" title="Subir lugar">↑</button>
                              <button onClick={()=> reordenarParadas(i, i + 1)} disabled={i === (itinerario?.paradas?.length - 1)} className="w-8 h-7 rounded-full bg-white border border-[#E6EEF7] text-[#0F305B] grid place-items-center text-xs disabled:opacity-30" title="Bajar lugar">↓</button>
                              <button onClick={()=> handleEliminarParada(p.id)} className="w-8 h-8 rounded-full bg-white border border-[#FECACA] text-red-500 hover:bg-red-50 grid place-items-center" title="Quitar de la ruta">
                                <IconTrash/>
                              </button>
                            </div>
                            <button onClick={()=> abrirFichaPoi(p)} className="absolute -right-1 top-1/2 -translate-y-1/2 w-6 h-6 hidden">›</button>
                          </div>
                        </div>
                      )
                    })}
                    {(!itinerario || itinerario.paradas.length===0) && <p className="text-xs text-[#5A7896] bg-white border border-dashed border-[#E6EEF7] rounded-xl p-4 text-center">Sin lugares. Genera otra ruta o ajusta tu presupuesto/tiempo.</p>}
                  </div>
                  <div className="mt-4 bg-white border border-[#E6EEF7] rounded-2xl p-4 shadow-sm">
                    <h4 className="font-extrabold text-[#0F305B] text-sm">Agregar un lugar a tu ruta</h4>
                    <p className="text-xs text-[#5A7896] mt-1">Elige un lugar de la lista y se suma al final del itinerario.</p>
                    <div className="mt-3 flex gap-2">
                      <select value={lugarExtraId} onChange={e => setLugarExtraId(e.target.value)} className="flex-1 bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2.5 text-sm font-medium text-[#0F305B] outline-none">
                        <option value="">Selecciona un lugar…</option>
                        {lugaresExtra.filter(l => !itinerario?.paradas?.some(p => p.id === l.id)).map(l => (
                          <option key={l.id} value={l.id}>{l.nombre} • {l.categoria} • {l.costo === 0 ? "Gratis" : `$${l.costo.toLocaleString('es-CL')}`}</option>
                        ))}
                      </select>
                      <button onClick={handleAgregarLugarPropio} disabled={!lugarExtraId} className="bg-[#0F305B] text-white text-sm font-extrabold px-4 py-2.5 rounded-xl disabled:opacity-40">Agregar</button>
                    </div>
                  </div>
                  {itinerario?.paradas?.length > 1 && (
                    <button onClick={()=> setItinerario({...itinerario, paradas: []})} className="mt-3 w-full text-xs font-bold text-red-500 hover:text-red-600">Vaciar itinerario</button>
                  )}
                </div>
                <div className="px-5 mt-6 flex gap-3">
                  <button onClick={()=> setPantalla('FORM')} className="flex-1 bg-white border border-[#E6EEF7] font-extrabold py-3.5 rounded-full text-sm text-[#0F305B]">← Ajustar ruta</button>
                  <button onClick={handleGuardar} className="flex-1 bg-[#FFC727] text-[#0F305B] font-extrabold py-3.5 rounded-full text-sm shadow border border-[#FFB800]">Guardar ruta</button>
                </div>
                <div className="px-5 mt-3"><button onClick={()=> setPantalla('HOME')} className="w-full bg-[#0F305B] text-white font-extrabold py-3.5 rounded-full text-sm">Volver al inicio</button></div>
              </motion.div>
            )}

            {/* MIS RUTAS */}
            {(pantalla==='MISRUTAS' || pantalla==='GUARDADA') && (
              <motion.div key="misrutas" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
                <div className="bg-white border-b border-[#E6EEF7] px-5 pt-6 pb-4">
                  <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#0F305B]">‹ Volver</button>
                  <h1 className="text-lg font-extrabold text-[#0F305B] mt-1">Mis Rutas</h1>
                  <p className="text-sm text-[#5A7896]">Tus itinerarios guardados y su avance</p>
                </div>
                <div className="px-5 mt-5">
                  {!rutaGuardada ? (
                    <div className="bg-white border border-dashed border-[#E6EEF7] rounded-2xl p-8 text-center">
                      <p className="text-3xl">🗺️</p>
                      <p className="font-extrabold text-[#0F305B] mt-2">Sin rutas guardadas</p>
                      <p className="text-xs text-[#5A7896] mt-1">Genera una y pulsa “Guardar ruta”.</p>
                      <button onClick={()=> setPantalla('FORM')} className="mt-4 bg-[#0F305B] text-white font-extrabold px-5 py-2.5 rounded-full text-sm">Crear ruta</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white border border-[#E6EEF7] rounded-2xl overflow-hidden shadow-sm">
                        <img src={rutaGuardada.paradas?.[0]?.imagen} alt={rutaGuardada.titulo} className="h-32 w-full object-cover" />
                        <div className="p-4">
                          <h3 className="font-extrabold text-[#0F305B]">{rutaGuardada.titulo}</h3>
                          <p className="text-xs text-[#5A7896] mt-1">{rutaGuardada.duracionTotal} • {rutaGuardada.distancia} • {rutaGuardada.costoTotal}</p>
                          <p className="text-xs text-[#8AA0B8] mt-1">Guardada: {new Date(rutaGuardada.guardadaEn).toLocaleString('es-CL')}</p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs font-bold text-[#0F305B]"><span>Avance</span><span>{visitados.size}/{rutaGuardada.paradas.length}</span></div>
                            <div className="mt-1 h-2 bg-[#F1F5F9] border border-[#E6EEF7] rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${rutaGuardada.paradas.length ? (visitados.size/rutaGuardada.paradas.length)*100 : 0}%` }}/></div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button onClick={()=> setPantalla('RUTA')} className="flex-1 bg-white border border-[#E6EEF7] font-bold py-2 rounded-full text-sm text-[#0F305B]">Ver itinerario</button>
                            <button onClick={()=> abrirFichaPoi(rutaGuardada.paradas[0])} className="flex-1 bg-[#FFC727] font-extrabold py-2 rounded-full text-sm text-[#0F305B]">Ver detalle</button>
                          </div>
                          <div className="mt-4 bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3">
                            <p className="text-xs font-extrabold text-[#0F305B]">Checklist de esta ruta</p>
                            <div className="mt-2 space-y-1.5">
                              {rutaGuardada.paradas.map((p, idx)=> (
                                <div key={p.id} className="flex items-center gap-2 text-xs">
                                  <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                                    <input type="checkbox" checked={visitados.has(p.id)} onChange={()=> toggleVisitado(p.id)} className="w-4 h-4 rounded border-[#CBD5E1] text-[#0F305B] focus:ring-[#0F305B]" />
                                    <span className={`truncate ${visitados.has(p.id) ? "line-through text-[#5A7896]" : "text-[#0F305B] font-medium"}`}>{p.nombre}</span>
                                    {visitados.has(p.id) && <span className="text-emerald-600 font-bold">✓</span>}
                                  </label>
                                  <button onClick={()=> reordenarParadas(idx, idx - 1, true)} disabled={idx === 0} className="w-6 h-6 rounded-full border border-[#E6EEF7] grid place-items-center disabled:opacity-30" title="Subir">↑</button>
                                  <button onClick={()=> reordenarParadas(idx, idx + 1, true)} disabled={idx === rutaGuardada.paradas.length - 1} className="w-6 h-6 rounded-full border border-[#E6EEF7] grid place-items-center disabled:opacity-30" title="Bajar">↓</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* FICHA POI - con datos amigables y reseña */}
            {pantalla==='POI' && poiFicha && (
              <motion.div key="poi" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="pb-28 bg-[#F8FAFC]">
                <div className="relative h-56 w-full overflow-hidden">
                  <img src={poiFicha.imagen} alt={poiFicha.nombre} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/80 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
                    <button onClick={()=> setPantalla('RUTA')} className="bg-white px-4 py-2 rounded-full text-xs font-extrabold text-[#0F305B] shadow">‹ Volver</button>
                    <label className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E6EEF7] shadow cursor-pointer">
                      <input type="checkbox" checked={visitados.has(poiFicha.id)} onChange={()=> toggleVisitado(poiFicha.id)} className="w-4 h-4 rounded border-[#CBD5E1] text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-xs font-extrabold text-[#0F305B]">{visitados.has(poiFicha.id) ? "Visitado" : "Marcar visitado"}</span>
                    </label>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                    <span className="bg-white/95 text-[#0F305B] text-xs font-bold px-2.5 py-1 rounded-full border border-white">{poiFicha.categoria}</span>
                    <h1 className="text-lg font-extrabold text-white mt-2 leading-tight">{poiFicha.nombre}</h1>
                    <p className="text-white/90 text-xs mt-1">{poiFicha.horario} • {poiFicha.costoLabel}</p>
                  </div>
                </div>
                <div className="px-5 mt-5 space-y-4">
                  {/* Datos amigables reales */}
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-4 shadow-sm">
                    <h3 className="font-extrabold text-[#0F305B]">Detalle del lugar</h3>
                    <p className="text-sm text-[#3A5A7A] mt-2 leading-relaxed">{getDatoAmigable(poiFicha.id).desc}</p>
                    <div className="mt-4 grid gap-2">
                      <div className="flex items-start gap-3 bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3">
                        <span className="w-8 h-8 rounded-full bg-white border border-[#E6EEF7] grid place-items-center text-sm flex-shrink-0">📍</span>
                        <div><p className="text-xs font-extrabold text-[#0F305B]">Dirección</p><p className="text-xs text-[#5A7896] mt-0.5">{getDatoAmigable(poiFicha.id).direccion}</p></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3 text-center">
                          <p className="text-xs font-bold text-[#5A7896]">Horario</p><p className="text-xs font-extrabold text-[#0F305B] mt-1">{poiFicha.horario}</p>
                        </div>
                        <div className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3 text-center">
                          <p className="text-xs font-bold text-[#5A7896]">Duración</p><p className="text-xs font-extrabold text-[#0F305B] mt-1">{poiFicha.tiempoMin} min</p>
                        </div>
                        <div className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3 text-center">
                          <p className="text-xs font-bold text-[#5A7896]">Entrada</p><p className="text-xs font-extrabold text-[#0F305B] mt-1">{poiFicha.costoLabel}</p>
                        </div>
                      </div>
                      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 flex gap-2">
                        <span className="text-sm">💡</span>
                        <p className="text-xs text-[#92400E] font-medium">{getDatoAmigable(poiFicha.id).tip}</p>
                      </div>
                      <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-[#0F305B]">Estado de visita</span>
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${visitados.has(poiFicha.id) ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{visitados.has(poiFicha.id) ? '✓ Visitado' : 'Pendiente'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reseña con estrellas */}
                  <div className="bg-white border border-[#E6EEF7] rounded-2xl p-4 shadow-sm">
                    <h3 className="font-extrabold text-[#0F305B]">Deja tu reseña</h3>
                    <p className="text-xs text-[#5A7896] mt-1">Califica y comenta — ambos obligatorios</p>
                    <div className="mt-3 flex gap-1">
                      {[1,2,3,4,5].map(n=> (
                        <button key={n} onClick={()=> { setRating(n); setErrorResena(null)}} className={`w-10 h-10 rounded-full grid place-items-center border-2 transition ${rating>=n ? 'bg-[#FFC727] border-[#FFC727] text-[#0F305B]' : 'bg-white border-[#E6EEF7] text-[#CBD5E1] hover:border-[#FFC727]'}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={rating>=n ? "#0F305B" : "none"} stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-bold text-[#0F305B] self-center">{rating>0 ? `${rating}/5` : "Elige"}</span>
                    </div>
                    <textarea value={comentario} onChange={e=> { setComentario(e.target.value); setErrorResena(null)}} placeholder="¿Qué te pareció? Cuéntanos tu experiencia (mín. 10 caracteres)" rows={3} className="mt-3 w-full bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl px-3 py-2.5 text-sm text-[#0F305B] placeholder:text-[#8AA0B8] outline-none focus:border-[#0F305B] resize-none" />
                    {errorResena && <p className="text-xs text-red-600 font-bold mt-2">⚠ {errorResena}</p>}
                    <button onClick={handleEnviarResena} className="mt-3 w-full bg-[#0F305B] text-white font-extrabold py-2.5 rounded-full text-sm hover:bg-[#0A2540] transition">Enviar reseña</button>
                    {/* Lista reseñas */}
                    {(reviews[poiFicha.id]||[]).length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-extrabold text-[#0F305B]">Reseñas ({reviews[poiFicha.id].length})</p>
                        {reviews[poiFicha.id].map((r,i)=> (
                          <div key={i} className="bg-[#F8FAFC] border border-[#E6EEF7] rounded-xl p-3">
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(s=> <span key={s} className={s<=r.rating ? "text-[#FFC727]" : "text-[#E6EEF7]"}>★</span>)}
                              <span className="text-xs text-[#8AA0B8] ml-2">{r.fecha}</span>
                              <span className="text-xs font-bold text-[#0F305B] ml-auto">{r.autor}</span>
                            </div>
                            <p className="text-sm text-[#3A5A7A] mt-1 leading-relaxed">{r.comentario}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={()=> setPantalla('HOME')} className="w-full bg-[#0F305B] text-white font-extrabold py-3 rounded-full text-sm">Volver al inicio</button>
                </div>
              </motion.div>
            )}

            {/* AYUDA */}
            {(pantalla==='AYUDA') && (
              <motion.div key="ayuda" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-28">
                <div className="bg-white border-b border-[#E6EEF7] px-5 pt-6 pb-4">
                  <button onClick={()=> setPantalla('HOME')} className="text-xs font-bold text-[#0F305B]">‹ Volver</button>
                  <h1 className="text-lg font-extrabold text-[#0F305B] mt-1">Ayuda</h1>
                  <p className="text-sm text-[#5A7896]">Contacto y preguntas frecuentes</p>
                </div>
                <div className="px-5 mt-5 space-y-3">
                  {[
                    { q: "¿Cómo genera rutas con mi presupuesto?", a: "Descartamos automáticamente los lugares que exceden tu tiempo y presupuesto, mostrándote solo lo viable." },
                    { q: "¿Funciona sin internet?", a: "Sí, guarda tu ruta y el checklist de visita sigue disponible offline." },
                    { q: "¿De dónde salen los datos?", a: "Lugares reales de Santiago con precios y horarios actualizados." },
                  ].map(f=> (
                    <div key={f.q} className="bg-white border border-[#E6EEF7] rounded-2xl p-4 shadow-sm">
                      <p className="font-extrabold text-[#0F305B] text-sm">{f.q}</p>
                      <p className="text-xs text-[#5A7896] mt-1 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                  <div className="bg-[#0F305B] rounded-2xl p-4 text-white"><p className="font-extrabold text-sm">¿Aún necesitas ayuda?</p><p className="text-xs text-white/70 mt-1">soporte@santiago.inteligente.cl • +56 9 1234 5678</p><button className="mt-3 bg-[#FFC727] text-[#0F305B] font-extrabold px-4 py-2 rounded-full text-xs">Contactar</button></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NAVBAR - simbología mejorada - oculto en FORM para dejar botón Generar central */}
        {pantalla !== 'FORM' && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E6EEF7] px-6 pt-2 pb-4 rounded-t-3xl shadow-[0_-8px_24px_rgba(15,48,91,0.08)]">
          <div className="flex items-center justify-between">
            {[
              { id: 'HOME', label: 'Explorar', icon: <IconExplorar/>, go: 'HOME' },
              { id: 'FORM', label: 'Crear Ruta', icon: <IconCrearRuta/>, go: 'FORM' },
              { id: 'MISRUTAS', label: 'Mis Rutas', icon: <span className="text-lg">🗺️</span>, go: 'MISRUTAS' },
              { id: 'PERFIL', label: 'Perfil', icon: <span className="text-lg">👤</span>, go: 'PERFIL' },
            ].map(item => {
              const active = (pantalla==='HOME' && item.id==='HOME') || (pantalla==='FORM' && item.id==='FORM') || (pantalla==='RUTA' && item.id==='FORM') || ((pantalla==='MISRUTAS' || pantalla==='GUARDADA') && item.id==='MISRUTAS') || ((pantalla==='PERFIL' || pantalla==='DATOS') && item.id==='PERFIL')
              return (
                <button key={item.id} onClick={()=> setPantalla(item.go)} className={`flex flex-col items-center gap-1 min-w-[64px] ${active ? 'text-[#0F305B]' : 'text-[#8AA0B8]'}`}>
                  <span className={`w-7 h-7 grid place-items-center rounded-full ${active ? 'bg-[#E6EEF7]' : ''}`}>{item.icon}</span>
                  <span className="text-[11px] font-extrabold leading-none">{item.label}</span>
                </button>
              )
            })}
          </div>
          <div className="w-24 h-1 bg-[#0F305B] rounded-full mx-auto mt-3" />
        </div>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A2540]/60 backdrop-blur-sm grid place-items-center z-50">
              <div className="bg-white border border-[#E6EEF7] rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 mx-8">
                <span className="w-10 h-10 border-3 border-[#E6EEF7] border-t-[#0F305B] rounded-full animate-spin" style={{ borderWidth: 3 }} />
                <p className="font-extrabold text-[#0F305B] text-sm">Generando tu ruta...</p>
                <p className="text-xs text-[#5A7896] text-center font-medium">Filtrando lugares según tu presupuesto y tiempo</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
