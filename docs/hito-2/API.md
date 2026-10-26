# API de Rutia · v1

- **URL base:** `http://localhost:8000/api/v1`
- **Versionado:** en la ruta (`/api/v1`). Un cambio incompatible se publica como `/api/v2` sin romper a los clientes de `v1`.
- **Formato:** JSON en el cuerpo de peticiones y respuestas.
- **Idioma:** cabecera `Accept-Language: es` (por defecto) o `en`. Cambia los nombres, descripciones, horarios y mensajes de error.
- **Documentación interactiva:** `http://localhost:8000/docs` (generada por FastAPI desde el código).
- **Autenticación:** sin tokens en este hito; `usuario_id` viaja en la petición. Se agrega en el Hito 3.

## Formato de error (todas las rutas)

```json
{
  "error": {
    "codigo": "LUGAR_NO_ENCONTRADO",
    "mensaje": "No existe un lugar con id 99.",
    "detalles": []
  }
}
```

En un error de validación (422), `detalles` trae un elemento por campo: `{"campo": "tiempo_horas", "mensaje": "Debe ser mayor que 0."}`. Un error inesperado responde 500 con un mensaje genérico; el detalle técnico solo queda en el registro del servidor.

## Rutas

| Recurso | Verbo y ruta | Parámetros / cuerpo | Éxito | Errores |
|---|---|---|---|---|
| Salud | `GET /health` | — | 200 | 503 base no disponible |
| Categorías | `GET /categorias` | — | 200 | — |
| Lugares | `GET /lugares` | Query: `categoria`, `costo_max`, `duracion_max`, `limit` (1-100, por defecto 50), `offset` | 200 `{datos, total, limit, offset}` | 422 categoría inexistente o filtro inválido |
| Lugares | `GET /lugares/{id}` | — | 200 | 404 |
| Lugares | `POST /lugares` | Cuerpo: lugar completo (ver ejemplo) | 201 + cabecera `Location` | 409 slug duplicado · 422 |
| Lugares | `PUT /lugares/{id}` | Cuerpo: lugar completo (reemplaza) | 200 | 404 · 409 · 422 |
| Lugares | `DELETE /lugares/{id}` | — | 204 | 404 · 409 está en una ruta guardada |
| Usuarios | `POST /usuarios` | `{nombre, email, password, idioma}` | 201 + `Location` | 409 email registrado · 422 |
| Usuarios | `POST /usuarios/login` | `{email, password}` | 200 datos públicos del usuario | 401 · 422 |
| Usuarios | `GET /usuarios/{id}` | — | 200 | 404 |
| Rutas | `POST /rutas/generar` | `{tiempo_horas, presupuesto_clp, intereses[], usuario_id?, incluir_visitados?}` | 200 ruta propuesta (no se guarda) | 404 usuario · 422 |
| Rutas | `POST /rutas` | `{usuario_id, nombre, lugares[], tiempo_horas?, presupuesto_clp?}` | 201 + `Location` | 404 usuario · 422 lugar inexistente o repetido |
| Rutas | `GET /usuarios/{id}/rutas` | — | 200 lista resumida | 404 |
| Rutas | `GET /rutas/{id}` | — | 200 con paradas y lugares | 404 |
| Rutas | `PUT /rutas/{id}` | `{nombre, lugares[], tiempo_horas?, presupuesto_clp?}` | 200 (totales recalculados) | 404 · 422 |
| Rutas | `DELETE /rutas/{id}` | — | 204 | 404 |
| Visitas | `POST /usuarios/{id}/visitas` | `{lugar_id, ruta_id?}` | 201 | 404 usuario · 422 lugar o ruta inválidos |
| Visitas | `GET /usuarios/{id}/visitas` | — | 200 (más recientes primero) | 404 |
| Visitas | `DELETE /visitas/{id}` | — | 204 | 404 |

## Ejemplos

### Crear un lugar · `POST /lugares` → 201

```json
{
  "slug": "barrio-lastarria",
  "categoria": "historico",
  "nombre_es": "Barrio Lastarria",
  "nombre_en": "Lastarria Neighborhood",
  "descripcion_es": "Barrio patrimonial con cafés, librerías y galerías.",
  "descripcion_en": "Heritage neighborhood with cafés, bookshops and galleries.",
  "comuna": "Santiago",
  "latitud": -33.4372,
  "longitud": -70.6386,
  "costo_clp": 0,
  "duracion_min": 45,
  "horario_es": "Lun-Dom 10:00-20:00",
  "horario_en": "Mon-Sun 10:00-20:00",
  "contenido_rotativo": false
}
```

### Generar una ruta · `POST /rutas/generar` → 200

Petición (caso Daniel del Hito 1):

```json
{ "tiempo_horas": 4, "presupuesto_clp": 15000, "intereses": ["museos", "gastronomia"] }
```

Respuesta (resumida):

```json
{
  "tiempo_disponible_min": 240,
  "presupuesto_clp": 15000,
  "duracion_total_min": 221,
  "costo_total_clp": 5500,
  "paradas": [
    { "orden": 1, "traslado_min": 0, "lugar": { "id": 1, "nombre": "Museo Nacional de Bellas Artes", "costo_clp": 0, "duracion_min": 60 } },
    { "orden": 2, "traslado_min": 2, "lugar": { "id": 2, "nombre": "Museo de Arte Contemporáneo", "costo_clp": 1000, "duracion_min": 50 } },
    { "orden": 3, "traslado_min": 7, "lugar": { "id": 3, "nombre": "Emporio La Rosa", "costo_clp": 4500, "duracion_min": 40 } },
    { "orden": 4, "traslado_min": 17, "lugar": { "id": 9, "nombre": "Centro Cultural Gabriela Mistral (GAM)", "costo_clp": 0, "duracion_min": 45 } }
  ],
  "mensaje": null
}
```

Si ningún lugar cabe, responde 200 con `paradas: []` y un `mensaje` que sugiere ampliar el tiempo o el presupuesto.

### Cómo elige las paradas

1. La capa de datos trae los lugares activos de los intereses elegidos que, por sí solos, caben en el tiempo y el presupuesto.
2. Si viene `usuario_id`, se descartan los lugares ya visitados, salvo los de `contenido_rotativo` (exposiciones, carta de temporada). Con `incluir_visitados: true` no se descarta ninguno.
3. Se parte por el más barato y luego se agrega siempre el más cercano (distancia de Haversine) que todavía cabe, contando 15 minutos de caminata por km.
4. Máximo 6 paradas.
