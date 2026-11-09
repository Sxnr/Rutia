// Guardados: rutas guardadas y lugares visitados del usuario. Se recarga cada vez que se abre la pestaña.
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

import { api } from '../../api'
import { Chip, Encabezado, Pantalla } from '../../componentes/basicos'
import { Cargando, ErrorVista, Vacio } from '../../componentes/estados'
import { BotonIcono, LugarTarjeta } from '../../componentes/lugares'
import { useIdioma } from '../../estado/IdiomaContexto'
import { useSesion } from '../../estado/SesionContexto'
import { colores, radios, sombra } from '../../tema'
import { formatearCosto, formatearDuracion, formatearFecha } from '../../utilidades/formato'

export default function Guardados() {
  const router = useRouter()
  const { t, idioma } = useIdioma()
  const { usuario, cargando: cargandoSesion, cerrarSesion } = useSesion()
  const [pestana, setPestana] = useState('rutas')
  const [rutas, setRutas] = useState([])
  const [visitas, setVisitas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    if (!usuario) return
    setCargando(true)
    setError(null)
    try {
      const [misRutas, misVisitas] = await Promise.all([api.rutasDeUsuario(usuario.id), api.visitas(usuario.id)])
      setRutas(misRutas)
      setVisitas(misVisitas)
    } catch (e) {
      // El usuario guardado ya no existe (por ejemplo, se recreó la base): se cierra la sesión
      if (e.codigo === 'USUARIO_NO_ENCONTRADO') cerrarSesion()
      else setError(e)
    } finally {
      setCargando(false)
    }
  }, [usuario, idioma, cerrarSesion])

  useFocusEffect(
    useCallback(() => {
      cargar()
    }, [cargar]),
  )

  const quitarVisita = async (visitaId) => {
    try {
      await api.borrarVisita(visitaId)
      setVisitas((actuales) => actuales.filter((v) => v.id !== visitaId))
    } catch (e) {
      setError(e)
    }
  }

  const encabezado = (
    <View>
      <Encabezado titulo={t('guardados.titulo')} subtitulo={t('guardados.subtitulo')} />
      {usuario ? (
        <View style={estilos.pestanas}>
          <Chip texto={t('guardados.rutas')} activo={pestana === 'rutas'} onPress={() => setPestana('rutas')} />
          <Chip texto={t('guardados.visitados')} activo={pestana === 'visitados'} onPress={() => setPestana('visitados')} />
        </View>
      ) : null}
    </View>
  )

  if (cargandoSesion) {
    return (
      <Pantalla>
        {encabezado}
        <Cargando />
      </Pantalla>
    )
  }

  if (!usuario) {
    return (
      <Pantalla>
        {encabezado}
        <Vacio icono="🔐" texto={t('guardados.iniciaSesion')} accion={t('guardados.irAPerfil')} onAccion={() => router.push('/perfil')} />
      </Pantalla>
    )
  }

  let vacio
  if (cargando) vacio = <Cargando />
  else if (error) vacio = <ErrorVista error={error} onReintentar={cargar} />
  else if (pestana === 'rutas')
    vacio = <Vacio titulo={t('guardados.sinRutas')} texto={t('guardados.sinRutasAyuda')} accion={t('guardados.crearRuta')} onAccion={() => router.push('/crear')} />
  else vacio = <Vacio icono="📍" texto={t('guardados.sinVisitados')} />

  const listo = !cargando && !error

  return (
    <Pantalla>
      {pestana === 'rutas' ? (
        <FlatList
          data={listo ? rutas : []}
          keyExtractor={(ruta) => String(ruta.id)}
          ListHeaderComponent={encabezado}
          ListEmptyComponent={vacio}
          contentContainerStyle={estilos.lista}
          refreshing={false}
          onRefresh={cargar}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/rutas/${item.id}`)}
              accessibilityRole="button"
              style={({ pressed }) => [estilos.ruta, pressed && estilos.presionado]}
            >
              <Text style={estilos.rutaIcono}>🗺️</Text>
              <View style={estilos.flex}>
                <Text style={estilos.rutaNombre} numberOfLines={2}>{item.nombre}</Text>
                <Text style={estilos.rutaDetalle}>
                  {item.cantidad_paradas === 1 ? t('comun.unLugar') : t('comun.lugares', { n: item.cantidad_paradas })} ·{' '}
                  {formatearDuracion(item.duracion_total_min)} · {formatearCosto(item.costo_total_clp, idioma, t('comun.gratis'))}
                </Text>
                <Text style={estilos.rutaFecha}>{formatearFecha(item.creada_en, idioma)}</Text>
              </View>
              <Text style={estilos.flecha}>›</Text>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={listo ? visitas : []}
          keyExtractor={(visita) => String(visita.id)}
          ListHeaderComponent={encabezado}
          ListEmptyComponent={vacio}
          contentContainerStyle={estilos.lista}
          refreshing={false}
          onRefresh={cargar}
          renderItem={({ item }) => (
            <View style={estilos.item}>
              <LugarTarjeta
                lugar={item.lugar}
                onPress={() => router.push(`/lugares/${item.lugar.id}`)}
                pie={t('guardados.visitadoEl', { fecha: formatearFecha(item.visitado_en, idioma) })}
                derecha={<BotonIcono texto="✕" etiqueta={t('guardados.quitarVisita')} onPress={() => quitarVisita(item.id)} peligro />}
              />
            </View>
          )}
        />
      )}
    </Pantalla>
  )
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  pestanas: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 16 },
  lista: { paddingBottom: 24 },
  item: { paddingHorizontal: 20, marginTop: 12 },
  ruta: {
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.medio,
    padding: 16,
    ...sombra,
  },
  presionado: { opacity: 0.85 },
  rutaIcono: { fontSize: 26 },
  rutaNombre: { fontSize: 15, fontWeight: '800', color: colores.azul },
  rutaDetalle: { fontSize: 12, color: colores.gris, marginTop: 3, fontWeight: '500' },
  rutaFecha: { fontSize: 11, color: colores.gris, marginTop: 2 },
  flecha: { fontSize: 24, color: colores.gris },
})
