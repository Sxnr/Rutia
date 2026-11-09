// Tarjeta de un lugar y fila de una parada de ruta.
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import { API_URL } from '../api'
import { useIdioma } from '../estado/IdiomaContexto'
import { colores, radios, sombra } from '../tema'
import { formatearCosto, formatearDuracion } from '../utilidades/formato'
import { urlImagen } from '../utilidades/imagenes'

export function Foto({ lugar, estilo }) {
  const uri = urlImagen(lugar?.imagen?.url, API_URL)
  if (!uri) return <View style={[estilo, estilos.fotoVacia]} />
  return <Image source={{ uri }} style={estilo} resizeMode="cover" accessibilityLabel={lugar.nombre} />
}

// Fila con foto, nombre, categoría, costo y duración
export function LugarTarjeta({ lugar, onPress, pie, derecha }) {
  const { t, idioma } = useIdioma()
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionado]}>
      <Foto lugar={lugar} estilo={estilos.foto} />
      <View style={estilos.cuerpo}>
        <Text style={estilos.nombre} numberOfLines={2}>{lugar.nombre}</Text>
        <Text style={estilos.detalle}>{lugar.categoria.nombre} · {formatearDuracion(lugar.duracion_min)}</Text>
        <Text style={estilos.costo}>{formatearCosto(lugar.costo_clp, idioma, t('comun.gratis'))}</Text>
        {pie ? <Text style={estilos.pie}>{pie}</Text> : null}
      </View>
      {derecha}
    </Pressable>
  )
}

// Parada numerada de una ruta: número (o ✓ si está visitada), foto, datos y acciones opcionales
export function ParadaFila({ parada, visitada = false, onPress, acciones, esUltima }) {
  const { t, idioma } = useIdioma()
  const { lugar } = parada
  return (
    <View style={estilos.parada}>
      <View style={estilos.linea}>
        <View style={[estilos.numero, visitada && estilos.numeroVisitado]}>
          <Text style={[estilos.numeroTexto, visitada && estilos.numeroTextoVisitado]}>{visitada ? '✓' : parada.orden}</Text>
        </View>
        {!esUltima ? <View style={[estilos.conector, visitada && estilos.conectorVisitado]} /> : null}
      </View>
      <View style={estilos.flex}>
        {parada.traslado_min > 0 ? (
          <Text style={estilos.traslado}>{t('parada.caminando', { min: parada.traslado_min })}</Text>
        ) : null}
        <View style={[estilos.tarjeta, visitada && estilos.tarjetaVisitada]}>
          <Pressable onPress={onPress} accessibilityRole="button" style={estilos.paradaContenido}>
            <Foto lugar={lugar} estilo={estilos.fotoChica} />
            <View style={estilos.cuerpo}>
              <Text style={[estilos.nombre, visitada && estilos.nombreVisitado]} numberOfLines={2}>{lugar.nombre}</Text>
              {lugar.horario ? <Text style={estilos.detalle}>{lugar.horario}</Text> : null}
              <View style={estilos.etiquetas}>
                <Text style={estilos.etiqueta}>{formatearCosto(lugar.costo_clp, idioma, t('comun.gratis'))}</Text>
                <Text style={estilos.etiqueta}>{formatearDuracion(lugar.duracion_min)}</Text>
              </View>
            </View>
          </Pressable>
          {acciones ? <View style={estilos.acciones}>{acciones}</View> : null}
        </View>
      </View>
    </View>
  )
}

// Botón redondo chico para subir, bajar o quitar una parada
export function BotonIcono({ texto, onPress, deshabilitado, etiqueta, peligro }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={6}
      style={[estilos.botonIcono, peligro && estilos.botonIconoPeligro, deshabilitado && estilos.inactivo]}
    >
      <Text style={[estilos.botonIconoTexto, peligro && estilos.textoPeligro]}>{texto}</Text>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.medio,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    ...sombra,
  },
  tarjetaVisitada: { backgroundColor: colores.exitoFondo, borderColor: colores.exitoBorde },
  presionado: { opacity: 0.85 },
  foto: { width: 76, height: 76, borderRadius: radios.chico },
  fotoChica: { width: 64, height: 64, borderRadius: radios.chico },
  fotoVacia: { backgroundColor: colores.azul },
  cuerpo: { flex: 1, gap: 3 },
  nombre: { fontSize: 15, fontWeight: '800', color: colores.azul },
  nombreVisitado: { color: colores.exito, textDecorationLine: 'line-through' },
  detalle: { fontSize: 12, color: colores.gris, fontWeight: '500' },
  costo: { fontSize: 13, fontWeight: '800', color: colores.azul },
  pie: { fontSize: 12, color: colores.gris, marginTop: 2 },
  parada: { flexDirection: 'row', gap: 10 },
  linea: { alignItems: 'center', width: 32 },
  numero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  numeroVisitado: { backgroundColor: colores.exito, borderColor: colores.exito },
  numeroTexto: { fontSize: 12, fontWeight: '800', color: colores.gris },
  numeroTextoVisitado: { color: colores.blanco },
  conector: { width: 2, flex: 1, backgroundColor: colores.borde, marginTop: 4, minHeight: 24 },
  conectorVisitado: { backgroundColor: colores.exitoBorde },
  traslado: { fontSize: 12, color: colores.gris, fontWeight: '600', marginBottom: 6 },
  paradaContenido: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  etiquetas: { flexDirection: 'row', gap: 6, marginTop: 4 },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.azul,
    backgroundColor: colores.crema,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.pildora,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  acciones: { gap: 6, alignItems: 'center' },
  botonIcono: {
    width: 32,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonIconoPeligro: { borderColor: '#FECACA' },
  botonIconoTexto: { fontSize: 14, color: colores.azul, fontWeight: '700' },
  textoPeligro: { color: colores.error },
  inactivo: { opacity: 0.3 },
})
