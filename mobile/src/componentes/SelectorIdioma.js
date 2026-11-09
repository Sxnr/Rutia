// Botón "ES | EN" para cambiar el idioma de toda la app.
import { Pressable, StyleSheet, Text } from 'react-native'

import { useIdioma } from '../estado/IdiomaContexto'
import { colores, radios } from '../tema'

export function SelectorIdioma() {
  const { idioma, cambiarIdioma } = useIdioma()
  const otro = idioma === 'es' ? 'en' : 'es'
  return (
    <Pressable
      onPress={() => cambiarIdioma(otro)}
      accessibilityRole="button"
      accessibilityLabel={idioma === 'es' ? 'Change language to English' : 'Cambiar idioma a español'}
      style={estilos.boton}
    >
      <Text style={estilos.texto}>
        <Text style={idioma === 'es' ? estilos.activo : estilos.inactivo}>ES</Text>
        <Text style={estilos.inactivo}> | </Text>
        <Text style={idioma === 'en' ? estilos.activo : estilos.inactivo}>EN</Text>
      </Text>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  boton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: radios.pildora,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    justifyContent: 'center',
  },
  texto: { fontSize: 13 },
  activo: { color: colores.azul, fontWeight: '800' },
  inactivo: { color: colores.gris, fontWeight: '600' },
})
