// Ruta sugerida: lo que devolvió POST /rutas/generar. Se puede nombrar y guardar.
// Para reordenar o quitar lugares primero se guarda: así el servidor recalcula los totales.
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { api, API_URL } from '../api'
import { Aviso, Boton, Pantalla } from '../componentes/basicos'
import { Vacio } from '../componentes/estados'
import { ParadaFila } from '../componentes/lugares'
import { useIdioma } from '../estado/IdiomaContexto'
import { useRuta } from '../estado/RutaContexto'
import { useSesion } from '../estado/SesionContexto'
import { colores, radios } from '../tema'
import { mensajeDeError } from '../utilidades/errores'
import { formatearCosto, formatearDuracion } from '../utilidades/formato'
import { urlImagen } from '../utilidades/imagenes'
import { validarNombreRuta } from '../utilidades/validacion'

export default function RutaSugerida() {
  const router = useRouter()
  const { t, idioma } = useIdioma()
  const { usuario } = useSesion()
  const { sugerida, preferencias } = useRuta()
  const [nombre, setNombre] = useState(() => t('sugerida.nombrePorDefecto'))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  if (!sugerida) {
    return (
      <Pantalla>
        <Vacio texto={t('sugerida.sinRuta')} accion={t('sugerida.crearRuta')} onAccion={() => router.replace('/crear')} />
      </Pantalla>
    )
  }

  const paradas = sugerida.paradas
  const portada = urlImagen(paradas[0]?.lugar?.imagen?.url, API_URL)
  const errorNombre = validarNombreRuta(nombre).errores.nombre

  const guardar = async () => {
    if (!usuario || errorNombre) return
    setGuardando(true)
    setError(null)
    try {
      const ruta = await api.guardarRuta({
        usuarioId: usuario.id,
        nombre: nombre.trim(),
        lugares: paradas.map((p) => p.lugar.id),
        tiempoHoras: preferencias.tiempoHoras,
        presupuesto: preferencias.presupuesto,
      })
      router.replace(`/rutas/${ruta.id}`)
    } catch (e) {
      setError(e)
    } finally {
      setGuardando(false)
    }
  }

  const contenidoPortada = (
    <SafeAreaView edges={['top']} style={estilos.portadaCapa}>
      <Pressable onPress={() => router.back()} style={estilos.pildora} accessibilityRole="button">
        <Text style={estilos.pildoraTexto}>{t('comun.volver')}</Text>
      </Pressable>
      <View>
        <Text style={estilos.etiqueta}>{t('sugerida.etiqueta')}</Text>
        <View style={estilos.totales}>
          <Text style={estilos.totalesTexto}>
            {formatearDuracion(sugerida.duracion_total_min)} · {formatearCosto(sugerida.costo_total_clp, idioma, t('comun.gratis'))} ·{' '}
            {paradas.length === 1 ? t('comun.unLugar') : t('comun.lugares', { n: paradas.length })}
          </Text>
        </View>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          maxLength={80}
          style={estilos.nombre}
          accessibilityLabel={t('sugerida.nombreRuta')}
          placeholder={t('sugerida.nombreRuta')}
          placeholderTextColor="rgba(255,255,255,0.6)"
        />
      </View>
    </SafeAreaView>
  )

  return (
    <Pantalla fondoSuperior={colores.azul}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={estilos.scroll}>
        {portada ? (
          <ImageBackground source={{ uri: portada }} style={estilos.portada} resizeMode="cover">
            <View style={estilos.oscurecer}>{contenidoPortada}</View>
          </ImageBackground>
        ) : (
          <View style={[estilos.portada, estilos.portadaSinFoto]}>{contenidoPortada}</View>
        )}

        <View style={estilos.cuerpo}>
          {paradas.length === 0 ? (
            <Vacio icono="🧭" texto={sugerida.mensaje} accion={t('sugerida.ajustar')} onAccion={() => router.back()} />
          ) : (
            <>
              <Text style={estilos.seccion}>{t('sugerida.itinerario')}</Text>
              <Text style={estilos.ayuda}>{t('sugerida.itinerarioAyuda')}</Text>
              <View style={estilos.paradas}>
                {paradas.map((parada, i) => (
                  <ParadaFila
                    key={parada.lugar.id}
                    parada={parada}
                    esUltima={i === paradas.length - 1}
                    onPress={() => router.push(`/lugares/${parada.lugar.id}`)}
                  />
                ))}
              </View>

              {errorNombre ? <Aviso texto={t(errorNombre)} /> : null}
              <Aviso texto={error ? mensajeDeError(error, t) : null} />
              {!usuario ? (
                <View style={estilos.sinSesion}>
                  <Aviso tipo="exito" texto={t('sugerida.iniciaSesion')} />
                  <Boton titulo={t('sugerida.irAPerfil')} variante="secundario" onPress={() => router.push('/perfil')} />
                </View>
              ) : null}

              <View style={estilos.botones}>
                <Boton titulo={t('sugerida.ajustar')} variante="borde" onPress={() => router.back()} estilo={estilos.flex} />
                <Boton
                  titulo={t('sugerida.guardar')}
                  onPress={guardar}
                  cargando={guardando}
                  deshabilitado={!usuario || Boolean(errorNombre)}
                  estilo={estilos.flex}
                />
              </View>
            </>
          )}
          <Boton titulo={t('sugerida.volverInicio')} variante="secundario" onPress={() => router.replace('/')} estilo={estilos.inicio} />
        </View>
      </ScrollView>
    </Pantalla>
  )
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 32 },
  portada: { height: 270, backgroundColor: colores.azul },
  portadaSinFoto: { justifyContent: 'flex-end' },
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
  etiqueta: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  totales: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radios.pildora,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  totalesTexto: { color: colores.azul, fontWeight: '700', fontSize: 12 },
  nombre: {
    color: colores.blanco,
    backgroundColor: 'transparent',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
  },
  cuerpo: { paddingHorizontal: 20, paddingTop: 20 },
  seccion: { fontSize: 17, fontWeight: '800', color: colores.azul },
  ayuda: { fontSize: 12, color: colores.gris, marginTop: 4, fontWeight: '500' },
  paradas: { marginTop: 16, gap: 12 },
  sinSesion: { marginTop: 8, gap: 8 },
  botones: { flexDirection: 'row', gap: 12, marginTop: 16 },
  inicio: { marginTop: 12 },
})
