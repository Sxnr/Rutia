-- =====================================================================
-- Rutia · Script de creación de la base de datos (PostgreSQL 15+)
-- Crea todas las tablas DESDE CERO. Borra los datos existentes.
-- Uso:  cd backend && python -m scripts.crear_base
--   o:  psql "$DATABASE_URL" -f db/schema.sql
-- =====================================================================

DROP TABLE IF EXISTS visitas;
DROP TABLE IF EXISTS ruta_paradas;
DROP TABLE IF EXISTS rutas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS lugares;
DROP TABLE IF EXISTS categorias;

-- ---------------------------------------------------------------------
-- categorias: los 4 intereses que el turista puede elegir (glosario del equipo).
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
    id          SERIAL PRIMARY KEY,
    codigo      TEXT NOT NULL UNIQUE,          -- valor que usa la API: 'museos', 'parques', 'patrimonio' o 'restaurantes'
    nombre_es   TEXT NOT NULL,
    nombre_en   TEXT NOT NULL
);

-- ---------------------------------------------------------------------
-- lugares: puntos de interés que el generador puede recomendar.
-- Todo texto visible es bilingüe (columnas _es y _en).
-- ---------------------------------------------------------------------
CREATE TABLE lugares (
    id                      SERIAL PRIMARY KEY,
    slug                    TEXT NOT NULL UNIQUE,           -- 'museo-bellas-artes'
    categoria_id            INTEGER NOT NULL REFERENCES categorias(id),
    nombre_es               TEXT NOT NULL,
    nombre_en               TEXT NOT NULL,
    descripcion_es          TEXT NOT NULL DEFAULT '',
    descripcion_en          TEXT NOT NULL DEFAULT '',
    direccion               TEXT,
    comuna                  TEXT,
    latitud                 NUMERIC(9, 6) NOT NULL CHECK (latitud BETWEEN -90 AND 90),
    longitud                NUMERIC(9, 6) NOT NULL CHECK (longitud BETWEEN -180 AND 180),
    costo_clp               INTEGER NOT NULL CHECK (costo_clp >= 0),   -- 0 = gratis
    duracion_min            INTEGER NOT NULL CHECK (duracion_min > 0), -- visita estimada
    horario_es              TEXT,
    horario_en              TEXT,
    contenido_rotativo      BOOLEAN NOT NULL DEFAULT FALSE, -- cambia su oferta (expos, temporada)
    imagen_archivo          TEXT,                           -- archivo en db/catalogo/fotos
    imagen_autor            TEXT,
    imagen_licencia         TEXT,
    imagen_fuente_url       TEXT,
    fuente_verificacion_url TEXT,                           -- dónde se verificó costo y horario
    verificado_en           DATE,
    activo                  BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en          TIMESTAMPTZ
);

CREATE INDEX idx_lugares_categoria ON lugares (categoria_id);
CREATE INDEX idx_lugares_costo_duracion ON lugares (costo_clp, duracion_min);

-- ---------------------------------------------------------------------
-- usuarios: turistas registrados. La contraseña se guarda como hash.
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,                    -- se guarda en minúsculas
    password_hash   TEXT NOT NULL,
    idioma          CHAR(2) NOT NULL DEFAULT 'es' CHECK (idioma IN ('es', 'en')),
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- rutas: rutas que el turista decidió guardar.
-- Los totales los calcula el servidor, nunca el cliente.
-- ---------------------------------------------------------------------
CREATE TABLE rutas (
    id                      SERIAL PRIMARY KEY,
    usuario_id              INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre                  TEXT NOT NULL,
    tiempo_disponible_min   INTEGER CHECK (tiempo_disponible_min > 0),
    presupuesto_clp         INTEGER CHECK (presupuesto_clp >= 0),
    duracion_total_min      INTEGER NOT NULL DEFAULT 0,
    costo_total_clp         INTEGER NOT NULL DEFAULT 0,
    creada_en               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizada_en          TIMESTAMPTZ
);

CREATE INDEX idx_rutas_usuario ON rutas (usuario_id);

-- ---------------------------------------------------------------------
-- ruta_paradas: lugares de una ruta, en orden.
-- Un lugar que está en una ruta guardada no se puede borrar (RESTRICT).
-- ---------------------------------------------------------------------
CREATE TABLE ruta_paradas (
    ruta_id         INTEGER NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    orden           INTEGER NOT NULL CHECK (orden > 0),
    lugar_id        INTEGER NOT NULL REFERENCES lugares(id) ON DELETE RESTRICT,
    traslado_min    INTEGER NOT NULL DEFAULT 0 CHECK (traslado_min >= 0),
    PRIMARY KEY (ruta_id, orden),
    UNIQUE (ruta_id, lugar_id)
);

-- ---------------------------------------------------------------------
-- visitas: lugares que el turista marcó como visitados.
-- Puede haber varias visitas al mismo lugar: el turista puede volver.
-- ---------------------------------------------------------------------
CREATE TABLE visitas (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    lugar_id        INTEGER NOT NULL REFERENCES lugares(id) ON DELETE CASCADE,
    ruta_id         INTEGER REFERENCES rutas(id) ON DELETE SET NULL,
    visitado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visitas_usuario_lugar ON visitas (usuario_id, lugar_id);

-- ---------------------------------------------------------------------
-- Datos de referencia: categorías fijas.
-- El catálogo de lugares se carga aparte desde db/catalogo/lugares.csv
-- con:  cd backend && python -m scripts.cargar_catalogo
-- ---------------------------------------------------------------------
INSERT INTO categorias (codigo, nombre_es, nombre_en) VALUES
    ('museos',       'Museos',       'Museums'),
    ('parques',      'Parques',      'Parks'),
    ('patrimonio',   'Patrimonio',   'Heritage'),
    ('restaurantes', 'Restaurantes', 'Restaurants');
