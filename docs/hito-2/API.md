# API de Rutia · v1

- **URL base:** `http://localhost:8000/api/v1`
- **Versionado:** en la ruta (`/api/v1`). Un cambio incompatible se publica como `/api/v2` sin romper a los clientes de `v1`.
- **Formato:** JSON en el cuerpo de peticiones y respuestas.
- **Idioma:** cabecera `Accept-Language: es` (por defecto) o `en`. Cambia los nombres, descripciones, horarios, categorías y mensajes de error.
- **Documentación interactiva:** `http://localhost:8000/docs` (generada por FastAPI desde el código).
- **Autenticación:** sin tokens en este hito; `usuario_id` viaja en la petición. Eliminar una cuenta exige la contraseña. Los tokens se agregan en el Hito 3.

## Códigos de estado

| Código | Cuándo | Capa que lo decide |
|---|---|---|
| 200 / 201 / 204 | Éxito: leído o actualizado / creado (con cabecera `Location`) / borrado | — |
| **400** | **Formato inválido:** falta un campo, tipo incorrecto, número fuera de rango, JSON mal escrito o campo no permitido | Presentación (Pydantic) |
| 401 | Credenciales o contraseña incorrectas | Negocio |
| 404 | El recurso no existe | Negocio |
| 409 | Choca con lo guardado: slug o correo repetido, lugar usado en una ruta | Negocio |
| **422** | **Regla de negocio no cumplida:** categoría inexistente, lugar repetido o inexistente en una ruta, ruta de otro usuario | Negocio |
| 429 | 5 contraseñas incorrectas en 15 minutos (cabecera `Retry-After` con los segundos de espera) | Negocio |
| 500 | Error inesperado: mensaje genérico, el detalle queda solo en el registro del servidor | Presentación |

Todos los errores usan el mismo formato:

```json
{
  "error": {
    "codigo": "VALIDACION",
    "mensaje": "Revisa el formato de los datos enviados.",
    "detalles": [
      { "campo": "tiempo_horas", "mensaje": "Debe ser mayor que 0." },
      { "campo": "intereses", "mensaje": "Debe tener al menos 1 elemento(s)." }
    ]
  }
}
```

`detalles` trae un elemento por campo en los errores 400 y viene vacío en los demás.

## Rutas

| Recurso | Verbo y ruta | Parámetros / cuerpo | Éxito | Errores |
|---|---|---|---|---|
| Salud | `GET /health` | — | 200 | 503 base no disponible |
| Categorías | `GET /categorias` | — | 200 | — |
| Lugares | `GET /lugares` | Query: `categoria`, `costo_max`, `duracion_max`, `limit` (1-100, por defecto 50), `offset` | 200 `{datos, total, limit, offset}` | 400 · 422 categoría inexistente |
| Lugares | `GET /lugares/{id}` | — | 200 | 400 · 404 |
| Lugares | `POST /lugares` | Cuerpo: lugar completo (ver ejemplo) | 201 + `Location` | 400 · 409 slug duplicado · 422 categoría inexistente |
| Lugares | `PUT /lugares/{id}` | Cuerpo: lugar completo (reemplaza) | 200 | 400 · 404 · 409 · 422 |
| Lugares | `DELETE /lugares/{id}` | — | 204 | 400 · 404 · 409 está en una ruta guardada |
| Rutas | `POST /rutas/generar` | `{tiempo_horas, presupuesto_clp, intereses[], cantidad?, usuario_id?, incluir_visitados?}` | 200 ruta propuesta (no se guarda) | 400 · 404 usuario · 422 categoría inexistente |
| Rutas | `POST /rutas/recalcular` | `{lugares[] en el nuevo orden, tiempo_horas?, presupuesto_clp?}` | 200 traslados y totales recalculados (no se guarda) | 400 · 422 lugar inexistente o repetido |
| Rutas | `POST /rutas` | `{usuario_id, nombre, lugares[], tiempo_horas?, presupuesto_clp?}` | 201 + `Location` | 400 · 404 usuario · 422 lugar inexistente o repetido |
| Rutas | `GET /usuarios/{id}/rutas` | — | 200 lista resumida | 400 · 404 |
| Rutas | `GET /rutas/{id}` | — | 200 con paradas y lugares | 400 · 404 |
| Rutas | `PUT /rutas/{id}` | `{nombre, lugares[], tiempo_horas?, presupuesto_clp?}` | 200 (totales recalculados) | 400 · 404 · 422 |
| Rutas | `DELETE /rutas/{id}` | — | 204 | 400 · 404 |
| Usuarios | `POST /usuarios` | `{nombre, email, password, idioma}` | 201 + `Location` | 400 · 409 correo registrado |
| Usuarios | `POST /usuarios/login` | `{email, password}` | 200 datos públicos del usuario | 400 · 401 · 429 |
| Usuarios | `GET /usuarios/{id}` | — (derecho de acceso) | 200 | 400 · 404 |
| Usuarios | `PUT /usuarios/{id}` | `{nombre, email, idioma}` (derecho de rectificación) | 200 | 400 · 404 · 409 correo de otro usuario |
| Usuarios | `DELETE /usuarios/{id}` | `{password}` (derecho de supresión: borra también sus rutas y visitas) | 204 | 400 · 401 · 404 · 429 |
| Usuarios | `GET /usuarios/{id}/datos` | — (derecho de portabilidad: archivo JSON descargable) | 200 `{exportado_en, usuario, rutas, visitas}` | 400 · 404 |
| Visitas | `POST /usuarios/{id}/visitas` | `{lugar_id, ruta_id?}` | 201 | 400 · 404 usuario · 422 lugar o ruta inválidos |
| Visitas | `GET /usuarios/{id}/visitas` | — | 200 (más recientes primero) | 400 · 404 |
| Visitas | `DELETE /visitas/{id}` | — | 204 | 400 · 404 |

## Ejemplos

### Crear un lugar · `POST /lugares` → 201

```json
{
  "slug": "barrio-lastarria",
  "categoria": "patrimonio",
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

Categorías válidas: `museos`, `parques`, `patrimonio` y `restaurantes`.

### Generar una ruta · `POST /rutas/generar` → 200

Petición (caso Daniel del Hito 1):

```json
{ "tiempo_horas": 4, "presupuesto_clp": 15000, "intereses": ["museos", "restaurantes"] }
```

Respuesta (resumida):

```json
{
  "tiempo_disponible_min": 240,
  "presupuesto_clp": 15000,
  "cantidad_objetivo": 4,
  "duracion_total_min": 229,
  "costo_total_clp": 5500,
  "paradas": [
    { "orden": 1, "traslado_min": 0, "lugar": { "id": 1, "nombre": "Museo Nacional de Bellas Artes", "costo_clp": 0, "duracion_min": 60 } },
    { "orden": 2, "traslado_min": 3, "lugar": { "id": 2, "nombre": "Museo de Arte Contemporáneo", "costo_clp": 1000, "duracion_min": 50 } },
    { "orden": 3, "traslado_min": 9, "lugar": { "id": 3, "nombre": "Emporio La Rosa", "costo_clp": 4500, "duracion_min": 40 } },
    { "orden": 4, "traslado_min": 22, "lugar": { "id": 9, "nombre": "Centro Cultural Gabriela Mistral (GAM)", "costo_clp": 0, "duracion_min": 45 } }
  ],
  "mensaje": null
}
```

- **Sin lugares compatibles:** responde 200 con `paradas: []` y un `mensaje` que sugiere ampliar el tiempo o el presupuesto.
- **Menos lugares de los buscados:** si caben menos, el `mensaje` lo explica. Por ejemplo: "Con tu tiempo y presupuesto caben 1 de los 3 lugares buscados".

### Recalcular una ruta reordenada · `POST /rutas/recalcular` → 200

```json
{ "lugares": [9, 3, 2, 1], "tiempo_horas": 4, "presupuesto_clp": 15000 }
```

La respuesta trae las paradas en ese orden con sus traslados y totales nuevos, más `excede_tiempo` y `excede_presupuesto`. Si alguno es `true`, el `mensaje` lo avisa. La app nunca suma costos ni tiempos: siempre pregunta al servidor.

### Eliminar la cuenta · `DELETE /usuarios/{id}` → 204

```json
{ "password": "clave-segura-123" }
```

Si la contraseña no es correcta, responde 401. Después de 5 intentos fallidos en 15 minutos, responde 429.

## Cómo elige las paradas

1. **Candidatos.** La capa de datos trae los lugares activos de los intereses elegidos que, por sí solos, caben en el tiempo y en el presupuesto.
2. **Revisitas.** Si viene `usuario_id`, se descartan los lugares ya visitados, salvo los de `contenido_rotativo` (exposiciones, carta de temporada). Con `incluir_visitados: true` no se descarta ninguno.
3. **Cantidad.** Se usa la `cantidad` pedida, de 2 a 5. Si no viene, se sugiere según el tiempo: hasta 2 h → 2 lugares, hasta 3 h → 3, hasta 5 h → 4, más de 5 h → 5.
4. **Orden.** Se parte por el lugar más barato y luego se agrega siempre el más cercano que todavía cabe.
5. **Traslado estimado a pie.** Distancia en línea recta (fórmula de Haversine) × 1,3, porque las calles no son rectas, a 4 km/h: unos 19,5 minutos por kilómetro. Es un supuesto declarado, no una ruta real por calles.
