// Capa Datos: Colección POIs (Esquemas Variables) - NoSQL
// Simula Mongoose ODM + CollPOI con esquemas variables según categoría
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
    imagen: "https://images.unsplash.com/photo-1540202404-a2f29016b523?q=80&w=800&auto=format&fit=crop",
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
    imagen: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=400&auto=format&fit=crop",
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
    imagen: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=400&auto=format&fit=crop",
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
    imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop",
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
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Cerro%20Santa%20Lucia%20Santiago.jpg?width=400",
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
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Plaza_de_Armas_Santiago_Chile.jpg?width=400",
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
    imagen: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop",
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
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/La_Chascona.jpg?width=400",
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
    imagen: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=400&auto=format&fit=crop",
    meta: { tipo: "centro-cultural", salas: 4 }
  },
]
