// Estados de carga, lista vacía y error: cada pantalla que pide datos los usa.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { useIdioma } from '../estado/IdiomaContexto'
import { colores } from '../tema'
import { mensajeDeError } from '../utilidades/errores'
import { Boton } from './basicos'

export function Cargando({ texto }) {
  const { t } = useIdioma()
  return (
    <View style={estilos.centro} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colores.azul} />
      <Text style={estilos.texto}>{texto ?? t('comun.cargando')}</Text>
    </View>
  )
}

export function Vacio({ icono = '🗺️', titulo, texto, accion, onAccion }) {
  return (
    <View style={[estilos.centro, estilos.caja]}>
      <Text style={estilos.icono}>{icono}</Text>
      {titulo ? <Text style={estilos.titulo}>{titulo}</Text> : null}
      {texto ? <Text style={estilos.texto}>{texto}</Text> : null}
      {accion ? <Boton titulo={accion} onPress={onAccion} variante="secundario" chico estilo={estilos.boton} /> : null}
    </View>
  )
}

export function ErrorVista({ error, onReintentar }) {
  const { t } = useIdioma()
  return (
    <View style={[estilos.centro, estilos.caja]} accessibilityLiveRegion="polite">
      <Text style={estilos.icono}>⚠️</Text>
      <Text style={estilos.texto}>{mensajeDeError(error, t)}</Text>
      {onReintentar ? (
        <Boton titulo={t('comun.reintentar')} onPress={onReintentar} variante="borde" chico estilo={estilos.boton} />
      ) : null}
    </View>
  )
}

const estilos = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  caja: {
    margin: 20,
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colores.borde,
    borderRadius: 18,
  },
  icono: { fontSize: 32 },
  titulo: { fontSize: 16, fontWeight: '800', color: colores.azul, textAlign: 'center' },
  texto: { fontSize: 13, color: colores.gris, textAlign: 'center', lineHeight: 19 },
  boton: { marginTop: 8, alignSelf: 'center' },
})
