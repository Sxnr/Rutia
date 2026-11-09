// Crear ruta: tiempo, presupuesto e intereses. El backend arma la ruta; aquí solo se valida y se envía.
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'

import { api } from '../../api'
import { Aviso, Boton, Chip, Encabezado, Pantalla, Tarjeta } from '../../componentes/basicos'
import { Cargando, ErrorVista } from '../../componentes/estados'
import { useIdioma } from '../../estado/IdiomaContexto'
import { useRuta } from '../../estado/RutaContexto'
import { useSesion } from '../../estado/SesionContexto'
import { colores, ICONOS_CATEGORIA, radios } from '../../tema'
import { mensajeDeError } from '../../utilidades/errores'
import { formatearHoras, formatearPesos } from '../../utilidades/formato'
import { LIMITES, leerMonto, validarPreferencias } from '../../utilidades/validacion'

const PASO_HORAS = 0.5
const MONTOS_RAPIDOS = [10000, 15000, 25000]

export default function CrearRuta() {
  const router = useRouter()
  const { t, idioma } = useIdioma()
  const { usuario } = useSesion()
  const { preferencias, setPreferencias, generar } = useRuta()

  const [categorias, setCategorias] = useState([])
  const [cargandoCategorias, setCargandoCategorias] = useState(true)
  const [errorCategorias, setErrorCategorias] = useState(null)
  const [textoMonto, setTextoMonto] = useState(Number.isFinite(preferencias.presupuesto) ? String(preferencias.presupuesto) : '')
  const [intentado, setIntentado] = useState(false) // los errores se muestran después del primer intento
  const [generando, setGenerando] = useState(false)
  const [errorApi, setErrorApi] = useState(null)

  const cargarCategorias = useCallback(async () => {
    setCargandoCategorias(true)
    setErrorCategorias(null)
    try {
      setCategorias(await api.categorias())
    } catch (e) {
      setErrorCategorias(e)
    } finally {
      setCargandoCategorias(false)
    }
  }, [idioma])

  useEffect(() => {
    cargarCategorias()
  }, [cargarCategorias])

  const actualizar = (cambios) => setPreferencias((actual) => ({ ...actual, ...cambios }))

  const cambiarTiempo = (delta) => {
    const nuevo = Math.min(LIMITES.tiempoMaxHoras, Math.max(LIMITES.tiempoMinHoras, preferencias.tiempoHoras + delta))
    actualizar({ tiempoHoras: nuevo })
  }

  const cambiarMonto = (texto) => {
    setTextoMonto(texto)
    const monto = leerMonto(texto)
    actualizar({ presupuesto: monto ?? Number.NaN })
  }

  const elegirMonto = (monto) => {
    setTextoMonto(String(monto))
    actualizar({ presupuesto: monto })
  }

  const alternarInteres = (codigo) => {
    const { intereses } = preferencias
    actualizar({ intereses: intereses.includes(codigo) ? intereses.filter((c) => c !== codigo) : [...intereses, codigo] })
  }

  const { valido, errores } = validarPreferencias(preferencias)

  const enviar = async () => {
    setIntentado(true)
    setErrorApi(null)
    if (!valido) return
    setGenerando(true)
    try {
      await generar(preferencias, usuario?.id)
      router.push('/sugerida')
    } catch (e) {
      setErrorApi(e)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <Pantalla>
      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
        <Encabezado titulo={t('preferencias.titulo')} subtitulo={t('preferencias.subtitulo')} />

        <Tarjeta estilo={estilos.tarjeta}>
          <View style={estilos.fila}>
            <Text style={estilos.subtitulo}>⏱ {t('preferencias.tiempo')}</Text>
            <Text style={estilos.valor}>{formatearHoras(preferencias.tiempoHoras, idioma)}</Text>
          </View>
          <View style={estilos.paso}>
            <BotonPaso texto="−" etiqueta={t('preferencias.menos')} onPress={() => cambiarTiempo(-PASO_HORAS)} deshabilitado={preferencias.tiempoHoras <= LIMITES.tiempoMinHoras} />
            <View style={estilos.barraTiempo}>
              <View style={[estilos.barraRelleno, { width: `${(preferencias.tiempoHoras / LIMITES.tiempoMaxHoras) * 100}%` }]} />
            </View>
            <BotonPaso texto="+" etiqueta={t('preferencias.mas')} onPress={() => cambiarTiempo(PASO_HORAS)} deshabilitado={preferencias.tiempoHoras >= LIMITES.tiempoMaxHoras} />
          </View>
          {intentado && errores.tiempo ? <Text style={estilos.error}>⚠ {t(errores.tiempo)}</Text> : null}
        </Tarjeta>

        <Tarjeta estilo={estilos.tarjeta}>
          <Text style={estilos.subtitulo}>💰 {t('preferencias.presupuesto')}</Text>
          <View style={[estilos.monto, intentado && errores.presupuesto && estilos.montoError]}>
            <Text style={estilos.signo}>$</Text>
            <TextInput
              value={textoMonto}
              onChangeText={cambiarMonto}
              keyboardType="number-pad"
              maxLength={7}
              style={estilos.montoInput}
              accessibilityLabel={t('preferencias.presupuesto')}
            />
          </View>
          <View style={estilos.chips}>
            {MONTOS_RAPIDOS.map((monto) => (
              <Chip key={monto} texto={formatearPesos(monto, idioma)} activo={preferencias.presupuesto === monto} onPress={() => elegirMonto(monto)} />
            ))}
          </View>
          {intentado && errores.presupuesto ? <Text style={estilos.error}>⚠ {t(errores.presupuesto)}</Text> : null}
        </Tarjeta>

        <Tarjeta estilo={estilos.tarjeta}>
          <Text style={estilos.subtitulo}>{t('preferencias.intereses')}</Text>
          <Text style={estilos.ayuda}>{t('preferencias.interesesAyuda')}</Text>
          {cargandoCategorias ? <Cargando /> : null}
          {errorCategorias ? <ErrorVista error={errorCategorias} onReintentar={cargarCategorias} /> : null}
          <View style={estilos.intereses}>
            {categorias.map((c) => {
              const activo = preferencias.intereses.includes(c.codigo)
              return (
                <Pressable
                  key={c.codigo}
                  onPress={() => alternarInteres(c.codigo)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: activo }}
                  style={[estilos.interes, activo && estilos.interesActivo]}
                >
                  <Text style={estilos.interesIcono}>{ICONOS_CATEGORIA[c.codigo] ?? '📍'}</Text>
                  <Text style={[estilos.interesTexto, activo && estilos.interesTextoActivo]} numberOfLines={1}>{c.nombre}</Text>
                  {activo ? <Text style={estilos.interesTextoActivo}>✓</Text> : null}
                </Pressable>
              )
            })}
          </View>
          {intentado && errores.intereses ? <Text style={estilos.error}>⚠ {t(errores.intereses)}</Text> : null}
        </Tarjeta>

        {usuario ? (
          <Tarjeta estilo={[estilos.tarjeta, estilos.fila]}>
            <Text style={[estilos.ayuda, estilos.flex]}>{t('preferencias.incluirVisitados')}</Text>
            <Switch
              value={preferencias.incluirVisitados}
              onValueChange={(valor) => actualizar({ incluirVisitados: valor })}
              trackColor={{ true: colores.azul, false: colores.borde }}
              accessibilityLabel={t('preferencias.incluirVisitados')}
            />
          </Tarjeta>
        ) : null}

        <View style={estilos.margen}>
          <Aviso texto={errorApi ? mensajeDeError(errorApi, t) : null} />
        </View>
      </ScrollView>

      <View style={estilos.pie}>
        <Boton titulo={generando ? t('preferencias.generando') : t('preferencias.generar')} onPress={enviar} cargando={generando} />
        <Text style={estilos.ayudaCentro}>{t('preferencias.pie')}</Text>
      </View>
    </Pantalla>
  )
}

function BotonPaso({ texto, etiqueta, onPress, deshabilitado }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={8}
      style={[estilos.botonPaso, deshabilitado && estilos.inactivo]}
    >
      <Text style={estilos.botonPasoTexto}>{texto}</Text>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 24 },
  tarjeta: { marginHorizontal: 20, marginTop: 16 },
  margen: { marginHorizontal: 20 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  subtitulo: { fontSize: 16, fontWeight: '800', color: colores.azul },
  valor: {
    backgroundColor: colores.azul,
    color: colores.blanco,
    fontWeight: '800',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radios.pildora,
    overflow: 'hidden',
  },
  paso: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  botonPaso: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.crema,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPasoTexto: { fontSize: 22, fontWeight: '800', color: colores.azul },
  inactivo: { opacity: 0.35 },
  barraTiempo: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colores.crema, overflow: 'hidden' },
  barraRelleno: { height: 8, backgroundColor: colores.dorado },
  monto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: colores.crema,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.chico,
    paddingHorizontal: 12,
  },
  montoError: { borderColor: colores.error },
  signo: { fontSize: 18, fontWeight: '800', color: colores.gris, marginRight: 6 },
  montoInput: { flex: 1, fontSize: 18, fontWeight: '800', color: colores.azul, paddingVertical: 12 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  ayuda: { fontSize: 13, color: colores.gris, marginTop: 4, fontWeight: '500' },
  intereses: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  interes: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: radios.medio,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.crema,
  },
  interesActivo: { backgroundColor: colores.azul, borderColor: colores.azul },
  interesIcono: { fontSize: 16 },
  interesTexto: { flex: 1, fontSize: 14, fontWeight: '800', color: colores.gris },
  interesTextoActivo: { color: colores.blanco, fontWeight: '800' },
  error: { color: colores.error, fontSize: 12, fontWeight: '700', marginTop: 10 },
  pie: {
    backgroundColor: colores.blanco,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  ayudaCentro: { fontSize: 12, color: colores.gris, textAlign: 'center', marginTop: 8, fontWeight: '500' },
})
