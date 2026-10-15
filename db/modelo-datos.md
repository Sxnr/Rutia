# Modelo de Datos - Colección POIs (NoSQL - Esquemas Variables)

> Capa Datos del diagrama técnico: `CollPOI` consumida por `Mongoose ODM -> Repo -> Controller`

## Colección: `pois`
Base: `santiago_inteligente` (MongoDB). Un documento por Punto de Interés, esquema variable según `categoria`.

### Esquema base (común)
```js
{
  _id: ObjectId,
  id: String,              // ej: "poi_bellas_artes"
  categoria: String,       // Museos | Gastronomía | Histórico | Parques | Shopping | Vida Nocturna
  nombre: String,
  costo: Number,           // CLP, 0 = gratis
  tiempoMin: Number,       // duración estimada visita
  horario: String,         // "Mar-Dom 10:00-18:30"
  coords: [Number, Number],// [-33.4353, -70.6438]
  imagen: String,          // ruta local src/assets/places/ (imagen con licencia libre)
  credito: String,         // "Foto: <autor>, <licencia>" — ver CREDITS.md
  createdAt: Date
}
```

### Esquema variable (campo `meta`)
```js
// Museos
meta: { tipo: "museo", gratuito: Boolean, sala: String }

// Gastronomía
meta: { tipo: "cafe", especialidad: String, menu: [String] }

// Parques / Histórico
meta: { tipo: "parque", altura: String, senderos: Boolean }
// Histórico: { tipo: "palacio", cambioGuardia: String }
```

Relación con prototipo: `src/data/poisCollection.js` es el mock de esta colección. `src/server/repository.js` simula `ODM.find(filtros)`.

## Índices recomendados
```js
db.pois.createIndex({ categoria: 1 })
db.pois.createIndex({ costo: 1, tiempoMin: 1 })
```
