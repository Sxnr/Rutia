// Ruta guardada: reordenar, quitar paradas, renombrar, marcar visitas y borrar.
// Cada cambio se envía con PUT /rutas/{id} y el servidor devuelve los totales recalculados.
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

import { api } from '../../api'
import { Aviso, Boton, Encabezado, Pantalla, Tarjeta } from '../../componentes/basicos'
import { Cargando, ErrorVista } from '../../componentes/estados'
import { BotonIcono, ParadaFila } from '../../componentes/lugares'
import { useIdioma } from '../../estado/IdiomaContexto'
import { useSesion } from '../../estado/SesionContexto'
import { colores, radios } from '../../tema'
import { mensajeDeError } from '../../utilidades/errores'
import { formatearCosto, formatearDuracion, formatearFecha } from '../../utilidades/formato'
import { validarNombreRuta } from '../../utilidades/validacion'

export default function RutaGuardada() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { t, idioma } = useIdioma()
  const { usuario } = useSesion()
  const [ruta, setRuta] = useState(null)
  const [visitas, setVisitas] = useState([]) // visitas de esta ruta
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [ocupado, setOcupado] = useState(false) // mientras se guarda un cambio
  const [errorAccion, setErrorAccion] = useState(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [datos, todas] = await Promise.all([api.ruta(id), usuario ? api.visitas(usuario.id) : Promise.resolve([])])
      setRuta(datos)
      setNombre(datos.nombre)
      setVisitas(todas.filter((v) => v.ruta_id === datos.id))
    } catch (e) {
      setError(e)
    } finally {
      setCargando(false)
    }
  }, [id, usuario, idioma])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Ejecuta un cambio en el servidor mostrando el estado "ocupado" y el error si falla
  const ejecutar = async (accion) => {
    setOcupado(true)
    setErrorAccion(null)
    try {
      await accion()
    } catch (e) {
      setErrorAccion(e)
    } finally {
      setOcupado(false)
    }
  }

  const guardarCambios = (lugares, nuevoNombre = ruta.nombre) =>
    ejecutar(async () => {
      const actualizada = await api.actualizarRuta(ruta.id, {
        nombre: nuevoNombre,
        lugares,
        tiempoHoras: ruta.tiempo_disponible_min ? ruta.tiempo_disponible_min / 60 : null,
        presupuesto: ruta.presupuesto_clp,
      })
      setRuta(actualizada)
      setNombre(actualizada.nombre)
    })

  const idsActuales = () => ruta.paradas.map((p) => p.lugar.id)

  const mover = (indice, destino) => {
    const ids = idsActuales()
    const [movido] = ids.splice(indice, 1)
    ids.splice(destino, 0, movido)
    guardarCambios(ids)
  }

  const quitar = (indice) => guardarCambios(idsActuales().filter((_, i) => i !== indice))

  const alternarVisita = (lugarId) =>
    ejecutar(async () => {
      const existente = visitas.find((v) => v.lugar.id === lugarId)
      if (existente) {
        await api.borrarVisita(existente.id)
        setVisitas((actuales) => actuales.filter((v) => v.id !== existente.id))
      } else {
        const nueva = await api.marcarVisitado({ usuarioId: usuario.id, lugarId, rutaId: ruta.id })
        setVisitas((actuales) => [...actuales, nueva])
      }
    })

  const borrarRuta = () =>
    ejecutar(async () => {
      await api.borrarRuta(ruta.id)
      router.replace('/guardados')
    })

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/guardados'))

  if (cargando || error) {
    return (
      <Pantalla>
        <Encabezado titulo={t('ruta.etiqueta')} onVolver={volver} />
        {cargando ? <Cargando /> : <ErrorVista error={error} onReintentar={cargar} />}
      </Pantalla>
    )
  }

  const visitados = new Set(visitas.map((v) => v.lugar.id))
  const hechos = ruta.paradas.filter((p) => visitados.has(p.lugar.id)).length
  const total = ruta.paradas.length
  const nombreInvalido = validarNombreRuta(nombre).errores.nombre
  const nombreCambio = nombre.trim() !== ruta.nombre

  return (
    <Pantalla>
      <Encabezado
        titulo={ruta.nombre}
        subtitulo={`${formatearDuracion(ruta.duracion_total_min)} · ${formatearCosto(ruta.costo_total_clp, idioma, t('comun.gratis'))}`}
        onVolver={volver}
      />
      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
        <Tarjeta>
          <Text style={estilos.etiqueta}>{t('ruta.etiqueta')}</Text>
          <Text style={estilos.ayuda}>{t('ruta.guardadaEl', { fecha: formatearFecha(ruta.creada_en, idioma) })}</Text>
          <View style={estilos.renombrar}>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              maxLength={80}
              style={estilos.input}
              accessibilityLabel={t('sugerida.nombreRuta')}
            />
            <Boton
              titulo={t('ruta.renombrar')}
              variante="secundario"
              chico
              onPress={() => guardarCambios(idsActuales(), nombre.trim())}
              deshabilitado={!nombreCambio || Boolean(nombreInvalido) || ocupado}
            />
          </View>
          <Text style={estilos.avance}>{t('ruta.avance', { hechos, total })}</Text>
          <View style={estilos.barra}>
            <View style={[estilos.barraRelleno, { width: `${total ? (hechos / total) * 100 : 0}%` }]} />
          </View>
        </Tarjeta>

        <Text style={estilos.ayudaEdicion}>{t('ruta.editarAyuda')}</Text>
        <Aviso texto={errorAccion ? mensajeDeError(errorAccion, t) : null} />

        <View style={estilos.paradas}>
          {ruta.paradas.map((parada, i) => {
            const visitada = visitados.has(parada.lugar.id)
            return (
              <View key={parada.lugar.id}>
                <ParadaFila
                  parada={parada}
                  visitada={visitada}
                  esUltima={i === total - 1}
                  onPress={() => router.push(`/lugares/${parada.lugar.id}`)}
                  acciones={
                    <>
                      <BotonIcono texto="↑" etiqueta={t('parada.subir')} onPress={() => mover(i, i - 1)} deshabilitado={i === 0 || ocupado} />
                      <BotonIcono texto="↓" etiqueta={t('parada.bajar')} onPress={() => mover(i, i + 1)} deshabilitado={i === total - 1 || ocupado} />
                      <BotonIcono texto="✕" etiqueta={t('parada.quitar')} onPress={() => quitar(i)} deshabilitado={total === 1 || ocupado} peligro />
                    </>
                  }
                />
                {usuario ? (
                  <Pressable
                    onPress={() => alternarVisita(parada.lugar.id)}
                    disabled={ocupado}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: visitada }}
                    style={[estilos.visita, visitada && estilos.visitaHecha]}
                  >
                    <Text style={[estilos.visitaTexto, visitada && estilos.visitaTextoHecha]}>
                      {visitada ? t('ruta.visitado') : t('ruta.marcarVisitado')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )
          })}
        </View>

        <View style={estilos.borrar}>
          {confirmarBorrado ? (
            <Tarjeta>
              <Text style={estilos.confirmar}>{t('ruta.confirmarBorrar')}</Text>
              <View style={estilos.fila}>
                <Boton titulo={t('comun.cancelar')} variante="borde" chico onPress={() => setConfirmarBorrado(false)} estilo={estilos.flex} />
                <Boton titulo={t('comun.borrar')} variante="peligro" chico onPress={borrarRuta} cargando={ocupado} estilo={estilos.flex} />
              </View>
            </Tarjeta>
          ) : (
            <Boton titulo={t('ruta.borrar')} variante="peligro" onPress={() => setConfirmarBorrado(true)} />
          )}
        </View>
      </ScrollView>
    </Pantalla>
  )
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 32 },
  etiqueta: { fontSize: 11, fontWeight: '800', color: colores.gris, letterSpacing: 1.5 },
  ayuda: { fontSize: 12, color: colores.gris, marginTop: 4 },
  renombrar: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 },
  input: {
    flex: 1,
    backgroundColor: colores.crema,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.chico,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    fontWeight: '700',
    color: colores.azul,
  },
  avance: { fontSize: 13, fontWeight: '700', color: colores.azul, marginTop: 14 },
  barra: { height: 8, borderRadius: 4, backgroundColor: colores.crema, overflow: 'hidden', marginTop: 6 },
  barraRelleno: { height: 8, backgroundColor: colores.exito },
  ayudaEdicion: { fontSize: 12, color: colores.gris, marginTop: 16, fontWeight: '500' },
  paradas: { marginTop: 12, gap: 14 },
  visita: {
    alignSelf: 'flex-end',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    borderRadius: radios.pildora,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  visitaHecha: { backgroundColor: colores.exitoFondo, borderColor: colores.exitoBorde },
  visitaTexto: { fontSize: 12, fontWeight: '800', color: colores.azul },
  visitaTextoHecha: { color: colores.exito },
  borrar: { marginTop: 24 },
  confirmar: { fontSize: 14, fontWeight: '700', color: colores.azul, marginBottom: 12 },
  fila: { flexDirection: 'row', gap: 8 },
})
