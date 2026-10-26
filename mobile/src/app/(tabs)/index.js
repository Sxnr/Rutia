// Explorar: saludo, cambio de idioma, filtros por categoría, botón para crear ruta y lista de lugares.
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native'

import { api } from '../../api'
import { Boton, Chip, Pantalla } from '../../componentes/basicos'
import { Cargando, ErrorVista, Vacio } from '../../componentes/estados'
import { LugarTarjeta } from '../../componentes/lugares'
import { SelectorIdioma } from '../../componentes/SelectorIdioma'
import { useIdioma } from '../../estado/IdiomaContexto'
import { useSesion } from '../../estado/SesionContexto'
import { colores, ICONOS_CATEGORIA } from '../../tema'

const logo = require('../../../assets/images/logo.png')

export default function Explorar() {
  const router = useRouter()
  const { t, idioma } = useIdioma()
  const { usuario } = useSesion()
  const [categoria, setCategoria] = useState(null) // null = todas
  const [categorias, setCategorias] = useState([])
  const [datos, setDatos] = useState({ lugares: [], total: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [listaCategorias, pagina] = await Promise.all([api.categorias(), api.lugares({ categoria })])
      setCategorias(listaCategorias)
      setDatos({ lugares: pagina.datos, total: pagina.total })
    } catch (e) {
      setError(e)
    } finally {
      setCargando(false)
    }
  }, [categoria, idioma]) // idioma: al cambiarlo se vuelven a pedir los nombres traducidos

  useEffect(() => {
    cargar()
  }, [cargar])

  const cabecera = (
    <View>
      <View style={estilos.barra}>
        <Image source={logo} style={estilos.logo} accessibilityIgnoresInvertColors />
        <View style={estilos.flex}>
          <Text style={estilos.marca}>Rutia</Text>
          <Text style={estilos.saludo} numberOfLines={1}>
            {usuario ? t('explorar.saludo', { nombre: usuario.nombre.split(' ')[0] }) : t('explorar.saludoInvitado')}
          </Text>
        </View>
        <SelectorIdioma />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
        <Chip texto={t('explorar.todos')} activo={categoria === null} onPress={() => setCategoria(null)} />
        {categorias.map((c) => (
          <Chip
            key={c.codigo}
            texto={c.nombre}
            icono={ICONOS_CATEGORIA[c.codigo]}
            activo={categoria === c.codigo}
            onPress={() => setCategoria(c.codigo)}
          />
        ))}
      </ScrollView>

      <View style={estilos.bloque}>
        <Boton titulo={t('explorar.planificar')} onPress={() => router.push('/crear')} />
        <Text style={estilos.ayuda}>{t('explorar.planificarAyuda')}</Text>
      </View>

      <View style={estilos.bloque}>
        <Text style={estilos.seccion}>{t('explorar.lugares')}</Text>
        {!cargando && !error ? <Text style={estilos.ayudaIzquierda}>{t('explorar.lugaresAyuda', { total: datos.total })}</Text> : null}
      </View>
    </View>
  )

  let vacio = null
  if (cargando) vacio = <Cargando />
  else if (error) vacio = <ErrorVista error={error} onReintentar={cargar} />
  else vacio = <Vacio icono="🔎" texto={t('explorar.vacio')} />

  return (
    <Pantalla>
      <FlatList
        data={cargando || error ? [] : datos.lugares}
        keyExtractor={(lugar) => String(lugar.id)}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={vacio}
        renderItem={({ item }) => (
          <View style={estilos.item}>
            <LugarTarjeta lugar={item} onPress={() => router.push(`/lugares/${item.id}`)} />
          </View>
        )}
        contentContainerStyle={estilos.lista}
        refreshing={false}
        onRefresh={cargar}
      />
    </Pantalla>
  )
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colores.blanco,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  logo: { width: 42, height: 42, borderRadius: 14 },
  marca: { fontSize: 18, fontWeight: '800', color: colores.azul },
  saludo: { fontSize: 12, color: colores.gris, fontWeight: '500', marginTop: 2 },
  filtros: { gap: 8, paddingHorizontal: 20, paddingTop: 16 },
  bloque: { paddingHorizontal: 20, marginTop: 18 },
  ayuda: { fontSize: 12, color: colores.gris, textAlign: 'center', marginTop: 8, fontWeight: '500' },
  ayudaIzquierda: { fontSize: 12, color: colores.gris, marginTop: 4, fontWeight: '500' },
  seccion: { fontSize: 17, fontWeight: '800', color: colores.azul },
  lista: { paddingBottom: 24 },
  item: { paddingHorizontal: 20, marginTop: 12 },
})
