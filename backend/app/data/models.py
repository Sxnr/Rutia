"""Modelos SQLAlchemy: cada clase representa una tabla de db/schema.sql.

Las tablas se crean con db/schema.sql (escrito a mano), no desde estos modelos.
Si cambias una columna aquí, cámbiala también en schema.sql.
"""
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(Text, unique=True)
    nombre_es: Mapped[str] = mapped_column(Text)
    nombre_en: Mapped[str] = mapped_column(Text)


class Lugar(Base):
    __tablename__ = "lugares"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(Text, unique=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id"))
    nombre_es: Mapped[str] = mapped_column(Text)
    nombre_en: Mapped[str] = mapped_column(Text)
    descripcion_es: Mapped[str] = mapped_column(Text, default="")
    descripcion_en: Mapped[str] = mapped_column(Text, default="")
    direccion: Mapped[str | None] = mapped_column(Text)
    comuna: Mapped[str | None] = mapped_column(Text)
    # asdecimal=False: Python recibe float en vez de Decimal (más simple para calcular distancias)
    latitud: Mapped[float] = mapped_column(Numeric(9, 6, asdecimal=False))
    longitud: Mapped[float] = mapped_column(Numeric(9, 6, asdecimal=False))
    costo_clp: Mapped[int] = mapped_column(Integer)
    duracion_min: Mapped[int] = mapped_column(Integer)
    horario_es: Mapped[str | None] = mapped_column(Text)
    horario_en: Mapped[str | None] = mapped_column(Text)
    contenido_rotativo: Mapped[bool] = mapped_column(Boolean, default=False)
    imagen_archivo: Mapped[str | None] = mapped_column(Text)
    imagen_autor: Mapped[str | None] = mapped_column(Text)
    imagen_licencia: Mapped[str | None] = mapped_column(Text)
    imagen_fuente_url: Mapped[str | None] = mapped_column(Text)
    fuente_verificacion_url: Mapped[str | None] = mapped_column(Text)
    verificado_en: Mapped[date | None] = mapped_column(Date)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # lazy="joined": trae la categoría en la misma consulta del lugar
    categoria: Mapped[Categoria] = relationship(lazy="joined")


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(Text)
    email: Mapped[str] = mapped_column(Text, unique=True)
    password_hash: Mapped[str] = mapped_column(Text)
    idioma: Mapped[str] = mapped_column(String(2), default="es")
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Ruta(Base):
    __tablename__ = "rutas"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    nombre: Mapped[str] = mapped_column(Text)
    tiempo_disponible_min: Mapped[int | None] = mapped_column(Integer)
    presupuesto_clp: Mapped[int | None] = mapped_column(Integer)
    duracion_total_min: Mapped[int] = mapped_column(Integer, default=0)
    costo_total_clp: Mapped[int] = mapped_column(Integer, default=0)
    creada_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizada_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Las paradas se cargan junto con la ruta, ordenadas, y se borran con ella
    paradas: Mapped[list["RutaParada"]] = relationship(
        order_by="RutaParada.orden",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class RutaParada(Base):
    __tablename__ = "ruta_paradas"

    ruta_id: Mapped[int] = mapped_column(ForeignKey("rutas.id", ondelete="CASCADE"), primary_key=True)
    orden: Mapped[int] = mapped_column(Integer, primary_key=True)
    lugar_id: Mapped[int] = mapped_column(ForeignKey("lugares.id", ondelete="RESTRICT"))
    traslado_min: Mapped[int] = mapped_column(Integer, default=0)

    lugar: Mapped[Lugar] = relationship(lazy="joined")


class Visita(Base):
    __tablename__ = "visitas"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    lugar_id: Mapped[int] = mapped_column(ForeignKey("lugares.id", ondelete="CASCADE"))
    ruta_id: Mapped[int | None] = mapped_column(ForeignKey("rutas.id", ondelete="SET NULL"))
    visitado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lugar: Mapped[Lugar] = relationship(lazy="joined")
