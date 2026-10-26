// Capa Datos: Colección POIs (Esquemas Variables) - NoSQL
// Simula Mongoose ODM + CollPOI con esquemas variables según categoría
// Las fotos son locales (src/assets/places) con licencia libre — ver CREDITS.md
import imgBellasArte from '../../../assets/places/bellas-arte.jpg'
import imgMac from '../../../assets/places/mac.jpg'
import imgEmporio from '../../../assets/places/emporio.jpg'
import imgPatioBellavista from '../../../assets/places/patio-bellavista.jpg'
import imgSantaLucia from '../../../assets/places/santa-lucia.jpg'
import imgPlazaArmas from '../../../assets/places/plaza-armas.jpg'
import imgLaMoneda from '../../../assets/places/la-moneda.jpg'
import imgChascona from '../../../assets/places/chascona.jpg'
import imgGam from '../../../assets/places/gam.jpg'

export const poisCollection = [
  // Esquema Museos
  {
    id: "poi_bellas_artes",
    categoria: "Museos",
    nombre: "Museo Nacional de Bellas Artes",
    costo: 0,
    tiempoMin: 60,
    horario: "Mar-Dom 10:00-18:30",
    coords: [-33.4353, -70.6438],
    imagen: imgBellasArte,
    credito: "Foto: Pequeño mar, CC BY-SA 4.0",
    meta: { tipo: "museo", gratuito: true, sala: "Neoclásico" }
  },
  {
    id: "poi_mac",
    categoria: "Museos",
    nombre: "Museo de Arte Contemporáneo",
    costo: 1000,
    tiempoMin: 50,
    horario: "Mar-Dom 11:00-17:30",
    coords: [-33.436, -70.643],
    imagen: imgMac,
    credito: "Foto: Rodrigo Fernández, CC BY-SA 4.0",
    meta: { tipo: "museo", universidad: "U. de Chile" }
  },
  // Esquema Gastronomía (variable: incluye menú)
  {
    id: "poi_emporio",
    categoria: "Gastronomía",
    nombre: "Emporio La Rosa - Parque Forestal",
    costo: 4500,
    tiempoMin: 40,
    horario: "Lun-Dom 08:00-21:00",
    coords: [-33.433, -70.640],
    imagen: imgEmporio,
    credito: "Foto: Carlos yo, CC BY-SA 4.0",
    meta: { tipo: "cafe", especialidad: "Helado artesanal", menu: ["café", "empanadas"] }
  },
  {
    id: "poi_patios",
    categoria: "Gastronomía",
    nombre: "Patio Bellavista",
    costo: 8000,
    tiempoMin: 70,
    horario: "Lun-Dom 12:00-23:00",
    coords: [-33.425, -70.634],
    imagen: imgPatioBellavista,
    credito: "Foto: Carlos yo, CC BY-SA 4.0",
    meta: { tipo: "patio", terrazas: 12 }
  },
  // Esquema Parques / Histórico (variable: altura, senderos)
  {
    id: "poi_santalucia",
    categoria: "Parques",
    nombre: "Cerro Santa Lucía - Mirador",
    costo: 0,
    tiempoMin: 45,
    horario: "Lun-Dom 09:00-19:00",
    coords: [-33.440, -70.643],
    imagen: imgSantaLucia,
    credito: "Foto: Rjcastillo, CC BY-SA 4.0",
    meta: { tipo: "parque", altura: "629m", senderos: true }
  },
  {
    id: "poi_plaza",
    categoria: "Histórico",
    nombre: "Plaza de Armas",
    costo: 0,
    tiempoMin: 30,
    horario: "Lun-Dom 06:00-22:00",
    coords: [-33.438, -70.650],
    imagen: imgPlazaArmas,
    credito: "Foto: WeHaKa, CC BY-SA 4.0",
    meta: { tipo: "plaza", fundacion: "1541" }
  },
  {
    id: "poi_moneda",
    categoria: "Histórico",
    nombre: "Palacio La Moneda",
    costo: 0,
    tiempoMin: 40,
    horario: "Lun-Vie 09:00-17:00",
    coords: [-33.443, -70.653],
    imagen: imgLaMoneda,
    credito: "Foto: César Lara Pizarro, CC BY-SA 3.0",
    meta: { tipo: "palacio", cambioGuardia: "impares 10:00" }
  },
  {
    id: "poi_chascona",
    categoria: "Histórico",
    nombre: "La Chascona - Pablo Neruda",
    costo: 7500,
    tiempoMin: 50,
    horario: "Mar-Dom 10:00-18:00",
    coords: [-33.427, -70.634],
    imagen: imgChascona,
    credito: "Foto: David Berkowitz, CC BY 2.0",
    meta: { tipo: "casa-museo", poeta: "Neruda" }
  },
  {
    id: "poi_gam",
    categoria: "Museos",
    nombre: "GAM - Centro Gabriela Mistral",
    costo: 0,
    tiempoMin: 45,
    horario: "Mar-Dom 10:00-20:00",
    coords: [-33.443, -70.639],
    imagen: imgGam,
    credito: "Foto: ProtoplasmaKid, CC BY-SA 4.0",
    meta: { tipo: "centro-cultural", salas: 4 }
  },
]
