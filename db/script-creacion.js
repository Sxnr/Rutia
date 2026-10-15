// Script de creación - MongoDB (ejecutar con mongosh)
// Uso: mongosh < db/script-creacion.js  (requiere MONGODB_URI en .env)

db = db.getSiblingDB("santiago_inteligente");

// Limpia si existe (solo desarrollo)
db.pois.drop();

db.createCollection("pois");

db.pois.insertMany([
  {
    id: "poi_bellas_artes",
    categoria: "Museos",
    nombre: "Museo Nacional de Bellas Artes",
    costo: 0,
    tiempoMin: 60,
    horario: "Mar-Dom 10:00-18:30",
    coords: [-33.4353, -70.6438],
    imagen: "src/assets/places/bellas-arte.jpg",
    credito: "Foto: Pequeño mar, CC BY-SA 4.0",
    meta: { tipo: "museo", gratuito: true, sala: "Neoclásico" }
  },
  {
    id: "poi_emporio",
    categoria: "Gastronomía",
    nombre: "Emporio La Rosa - Parque Forestal",
    costo: 4500,
    tiempoMin: 40,
    horario: "Lun-Dom 08:00-21:00",
    coords: [-33.433, -70.64],
    imagen: "src/assets/places/emporio.jpg",
    credito: "Foto: Carlos yo, CC BY-SA 4.0",
    meta: { tipo: "cafe", especialidad: "Helado artesanal" }
  },
  {
    id: "poi_santalucia",
    categoria: "Parques",
    nombre: "Cerro Santa Lucía - Mirador",
    costo: 0,
    tiempoMin: 45,
    horario: "Lun-Dom 09:00-19:00",
    coords: [-33.44, -70.643],
    imagen: "src/assets/places/santa-lucia.jpg",
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
    coords: [-33.438, -70.65],
    imagen: "src/assets/places/plaza-armas.jpg",
    credito: "Foto: WeHaKa, CC BY-SA 4.0",
    meta: { tipo: "plaza", fundacion: "1541" }
  },
  {
    id: "poi_chascona",
    categoria: "Histórico",
    nombre: "La Chascona - Pablo Neruda",
    costo: 7500,
    tiempoMin: 50,
    horario: "Mar-Dom 10:00-18:00",
    coords: [-33.427, -70.634],
    imagen: "src/assets/places/chascona.jpg",
    credito: "Foto: David Berkowitz, CC BY 2.0",
    meta: { tipo: "casa-museo", poeta: "Neruda" }
  }
]);

// Índices
db.pois.createIndex({ categoria: 1 });
db.pois.createIndex({ costo: 1, tiempoMin: 1 });

print("✓ Colección pois creada con", db.pois.countDocuments(), "documentos");
