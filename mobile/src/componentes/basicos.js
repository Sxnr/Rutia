// Piezas visuales que usan todas las pantallas: pantalla, encabezado, tarjeta, botón, chip y campo.
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useIdioma } from '../estado/IdiomaContexto'
import { colores, radios, sombra } from '../tema'

// Fondo de pantalla: barra superior blanca (zona del reloj) y contenido crema
export function Pantalla({ children, fondoSuperior = colores.blanco }) {
  return (
    <SafeAreaView edges={['top']} style={[estilos.pantalla, { backgroundColor: fondoSuperior }]}>
      <View style={estilos.contenido}>{children}</View>
    </SafeAreaView>
  )
}

export function Encabezado({ titulo, subtitulo, onVolver, derecha }) {
  const { t } = useIdioma()
  return (
    <View style={estilos.encabezado}>
      <View style={estilos.encabezadoFila}>
        <View style={estilos.flex}>
          {onVolver ? (
            <Pressable onPress={onVolver} accessibilityRole="button" hitSlop={10}>
              <Text style={estilos.volver}>{t('comun.volver')}</Text>
            </Pressable>
          ) : null}
          <Text style={estilos.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {derecha}
      </View>
    </View>
  )
}

export function Tarjeta({ children, estilo }) {
  return <View style={[estilos.tarjeta, estilo]}>{children}</View>
}

const VARIANTES = {
  principal: { fondo: colores.dorado, borde: colores.dorado, texto: colores.azul },
  secundario: { fondo: colores.azul, borde: colores.azul, texto: colores.blanco },
  borde: { fondo: colores.blanco, borde: colores.borde, texto: colores.azul },
  peligro: { fondo: colores.blanco, borde: '#FECACA', texto: colores.error },
}

export function Boton({ titulo, onPress, variante = 'principal', cargando = false, deshabilitado = false, estilo, chico = false }) {
  const v = VARIANTES[variante]
  const inactivo = deshabilitado || cargando
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.boton,
        chico && estilos.botonChico,
        { backgroundColor: v.fondo, borderColor: v.borde },
        inactivo && estilos.botonInactivo,
        pressed && estilos.presionado,
        estilo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={v.texto} />
      ) : (
        <Text style={[estilos.botonTexto, chico && estilos.botonTextoChico, { color: v.texto }]}>{titulo}</Text>
      )}
    </Pressable>
  )
}

export function Chip({ texto, activo, onPress, icono }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[estilos.chip, activo && estilos.chipActivo]}
    >
      <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
        {icono ? `${icono} ` : ''}
        {texto}
      </Text>
    </Pressable>
  )
}

export function Campo({ etiqueta, error, ...props }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.campoEtiqueta}>{etiqueta}</Text>
      <TextInput
        placeholderTextColor={colores.gris}
        style={[estilos.campoInput, error && estilos.campoInputError]}
        accessibilityLabel={etiqueta}
        {...props}
      />
      {error ? <Text style={estilos.textoError}>⚠ {error}</Text> : null}
    </View>
  )
}

export function Aviso({ texto, tipo = 'error' }) {
  if (!texto) return null
  return (
    <View style={[estilos.aviso, tipo === 'exito' && estilos.avisoExito]}>
      <Text style={[estilos.avisoTexto, tipo === 'exito' && estilos.avisoTextoExito]}>{texto}</Text>
    </View>
  )
}

export const estilos = StyleSheet.create({
  flex: { flex: 1 },
  pantalla: { flex: 1 },
  contenido: { flex: 1, backgroundColor: colores.crema },
  encabezado: {
    backgroundColor: colores.blanco,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  encabezadoFila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { fontSize: 13, fontWeight: '700', color: colores.azul, marginBottom: 6 },
  titulo: { fontSize: 20, fontWeight: '800', color: colores.azul },
  subtitulo: { fontSize: 14, color: colores.gris, marginTop: 2, fontWeight: '500' },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.medio,
    padding: 16,
    ...sombra,
  },
  boton: {
    minHeight: 52,
    borderRadius: radios.pildora,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  botonChico: { minHeight: 38, paddingHorizontal: 14 },
  botonInactivo: { opacity: 0.45 },
  presionado: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  botonTexto: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  botonTextoChico: { fontSize: 13 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radios.pildora,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
  },
  chipActivo: { backgroundColor: colores.azul, borderColor: colores.azul },
  chipTexto: { fontSize: 14, fontWeight: '700', color: colores.gris },
  chipTextoActivo: { color: colores.blanco },
  campo: { marginBottom: 12 },
  campoEtiqueta: { fontSize: 12, fontWeight: '700', color: colores.azul, marginBottom: 6 },
  campoInput: {
    backgroundColor: colores.crema,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.chico,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: colores.azul,
  },
  campoInputError: { borderColor: colores.error },
  textoError: { color: colores.error, fontSize: 12, fontWeight: '700', marginTop: 6 },
  aviso: {
    backgroundColor: colores.errorFondo,
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: radios.chico,
    padding: 12,
    marginVertical: 8,
  },
  avisoExito: { backgroundColor: colores.exitoFondo, borderColor: colores.exitoBorde },
  avisoTexto: { color: colores.error, fontSize: 13, fontWeight: '600' },
  avisoTextoExito: { color: colores.exito },
})
