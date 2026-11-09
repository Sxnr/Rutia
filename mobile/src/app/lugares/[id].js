// Detalle de un lugar: foto con su crédito, datos prácticos y botón para marcarlo como visitado.
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { api, API_URL } from '../../api'
import { Aviso, Boton, Pantalla, Tarjeta } from '../../componentes/basicos'
import { Cargando, ErrorVista } from '../../componentes/estados'
import { useIdioma } from '../../estado/IdiomaContexto'
import { useSesion } from '../../estado/SesionContexto'
import { colores, ICONOS_CATEGORIA, radios } from '../../tema'
import { mensajeDeError } from '../../utilidades/errores'
import { formatearCosto, formatearDuracion } from '../../utilidades/formato'
import { urlImagen } from '../../utilidades/imagenes'

export default function DetalleLugar() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { t, idioma } = useIdioma()
  const { usuario } = useSesion()
  const [lugar, setLugar] = useState(null)
  const [visitado, setVisitado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [marcando, setMarcando] = useState(false)
  const [errorVisita, setErrorVisita] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [datos, visitas] = await Promise.all([api.lugar(id), usuario ? api.visitas(usuario.id) : Promise.resolve([])])
      setLugar(datos)
      setVisitado(visitas.some((v) => v.lugar.id === datos.id))
    } catch (e) {
      setError(e)
    } finally {
      setCargando(false)
    }
  }, [id, usuario, idioma])

  useEffect(() => {
    cargar()
  }, [cargar])

  const marcarVisitado = async () => {
    setMarcando(true)
    setErrorVisita(null)
    try {
      await api.marcarVisitado({ usuarioId: usuario.id, lugarId: lugar.id })
      setVisitado(true)
    } catch (e) {
      setErrorVisita(e)
    } finally {
      setMarcando(false)
    }
  }

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'))

  if (cargando || error) {
    return (
      <Pantalla>
        <View style={estilos.barraSimple}>
          <Pressable onPress={volver} accessibilityRole="button">
            <Text style={estilos.volverTexto}>{t('comun.volver')}</Text>
          </Pressable>
        </View>
        {cargando ? <Cargando /> : <ErrorVista error={error} onReintentar={cargar} />}
      </Pantalla>
    )
  }

  const foto = urlImagen(lugar.imagen?.url, API_URL)
  const portada = (
    <SafeAreaView edges={['top']} style={estilos.portadaCapa}>
      <Pressable onPress={volver} style={estilos.pildora} accessibilityRole="button">
        <Text style={estilos.pildoraTexto}>{t('comun.volver')}</Text>
      </Pressable>
      <View>
        <Text style={estilos.categoria}>
          {ICONOS_CATEGORIA[lugar.categoria.codigo] ?? '📍'} {lugar.categoria.nombre}
        </Text>
        <Text style={estilos.nombre}>{lugar.nombre}</Text>
      </View>
    </SafeAreaView>
  )

  return (
    <Pantalla fondoSuperior={colores.azul}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={estilos.scroll}>
        {foto ? (
          <ImageBackground source={{ uri: foto }} style={estilos.portada} resizeMode="cover" accessibilityLabel={lugar.nombre}>
            <View style={estilos.oscurecer}>{portada}</View>
          </ImageBackground>
        ) : (
          <View style={estilos.portada}>{portada}</View>
        )}
        {lugar.imagen?.autor ? (
          <Text style={estilos.credito}>{t('lugar.foto', { autor: lugar.imagen.autor, licencia: lugar.imagen.licencia ?? '' })}</Text>
        ) : null}

        <View style={estilos.cuerpo}>
          <Tarjeta>
            <Text style={estilos.seccion}>{t('lugar.detalle')}</Text>
            {lugar.descripcion ? <Text style={estilos.descripcion}>{lugar.descripcion}</Text> : null}

            <View style={estilos.dato}>
              <Text style={estilos.datoIcono}>📍</Text>
              <View style={estilos.flex}>
                <Text style={estilos.datoTitulo}>{t('lugar.direccion')}</Text>
                <Text style={estilos.datoTexto}>
                  {[lugar.direccion, lugar.comuna].filter(Boolean).join(', ') || t('lugar.sinDireccion')}
                </Text>
              </View>
            </View>

            <View style={estilos.grilla}>
              <Celda titulo={t('lugar.horario')} valor={lugar.horario ?? '—'} />
              <Celda titulo={t('lugar.duracion')} valor={formatearDuracion(lugar.duracion_min)} />
              <Celda titulo={t('lugar.entrada')} valor={formatearCosto(lugar.costo_clp, idioma, t('comun.gratis'))} />
            </View>

            {lugar.contenido_rotativo ? <Aviso tipo="exito" texto={`🔄 ${t('lugar.rotativo')}`} /> : null}
          </Tarjeta>

          <View style={estilos.visita}>
            {!usuario ? (
              <>
                <Text style={estilos.ayuda}>{t('lugar.iniciaSesion')}</Text>
                <Boton titulo={t('guardados.irAPerfil')} variante="borde" onPress={() => router.push('/perfil')} />
              </>
            ) : visitado ? (
              <Aviso tipo="exito" texto={t('lugar.visitado')} />
            ) : (
              <Boton titulo={t('lugar.marcarVisitado')} onPress={marcarVisitado} cargando={marcando} />
            )}
            <Aviso texto={errorVisita ? mensajeDeError(errorVisita, t) : null} />
          </View>
        </View>
      </ScrollView>
    </Pantalla>
  )
}

function Celda({ titulo, valor }) {
  return (
    <View style={estilos.celda}>
      <Text style={estilos.celdaTitulo}>{titulo}</Text>
      <Text style={estilos.celdaValor}>{valor}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 32 },
  barraSimple: { backgroundColor: colores.blanco, paddingHorizontal: 20, paddingVertical: 14 },
  volverTexto: { color: colores.azul, fontWeight: '700', fontSize: 13 },
  portada: { height: 260, backgroundColor: colores.azul },
  oscurecer: { flex: 1, backgroundColor: colores.azulTransparente },
  portadaCapa: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 },
  pildora: {
    alignSelf: 'flex-start',
    backgroundColor: colores.blanco,
    borderRadius: radios.pildora,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pildoraTexto: { color: colores.azul, fontWeight: '800', fontSize: 13 },
  categoria: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    color: colores.azul,
    fontWeight: '700',
    fontSize: 12,
    borderRadius: radios.pildora,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  nombre: { color: colores.blanco, fontSize: 22, fontWeight: '800', marginTop: 8 },
  credito: { fontSize: 10, color: colores.gris, textAlign: 'right', paddingHorizontal: 20, paddingTop: 6 },
  cuerpo: { paddingHorizontal: 20, paddingTop: 14, gap: 16 },
  seccion: { fontSize: 17, fontWeight: '800', color: colores.azul },
  descripcion: { fontSize: 14, color: colores.gris, lineHeight: 21, marginTop: 8 },
  dato: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: colores.crema,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.chico,
    padding: 12,
    marginTop: 14,
  },
  datoIcono: { fontSize: 16 },
  datoTitulo: { fontSize: 12, fontWeight: '800', color: colores.azul },
  datoTexto: { fontSize: 12, color: colores.gris, marginTop: 2 },
  grilla: { flexDirection: 'row', gap: 8, marginTop: 8 },
  celda: {
    flex: 1,
    backgroundColor: colores.crema,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.chico,
    padding: 10,
    alignItems: 'center',
  },
  celdaTitulo: { fontSize: 11, fontWeight: '700', color: colores.gris },
  celdaValor: { fontSize: 12, fontWeight: '800', color: colores.azul, marginTop: 4, textAlign: 'center' },
  visita: { gap: 8 },
  ayuda: { fontSize: 13, color: colores.gris, textAlign: 'center' },
})
