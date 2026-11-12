// Perfil: iniciar sesión o crear cuenta; con sesión, datos del usuario, idioma, cerrar sesión
// y los derechos de la Ley 21.719 (corregir, descargar y eliminar mis datos, con la contraseña).
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native'

import { api } from '../../api'
import { Aviso, Boton, Campo, Chip, Encabezado, Pantalla, Tarjeta } from '../../componentes/basicos'
import { SelectorIdioma } from '../../componentes/SelectorIdioma'
import { useIdioma } from '../../estado/IdiomaContexto'
import { useSesion } from '../../estado/SesionContexto'
import { colores } from '../../tema'
import { mensajeDeError } from '../../utilidades/errores'
import { validarContrasena, validarCorreccion, validarLogin, validarRegistro } from '../../utilidades/validacion'

export default function Perfil() {
  const { t } = useIdioma()
  const { usuario, cerrarSesion } = useSesion()

  return (
    <Pantalla>
      <KeyboardAvoidingView style={estilos.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
          <Encabezado titulo={t('perfil.titulo')} subtitulo={t('perfil.subtitulo')} derecha={<SelectorIdioma />} />
          <View style={estilos.cuerpo}>
            {usuario ? <Cuenta usuario={usuario} onSalir={cerrarSesion} /> : <Acceso />}
            {usuario ? <MisDatos usuario={usuario} /> : null}
            <Tarjeta>
              <Text style={estilos.seccion}>{t('perfil.sobre')}</Text>
              <Text style={estilos.texto}>{t('perfil.sobreTexto')}</Text>
              <Text style={estilos.aviso}>{t('perfil.aviso')}</Text>
            </Tarjeta>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  )
}

function Cuenta({ usuario, onSalir }) {
  const { t } = useIdioma()
  return (
    <Tarjeta>
      <View style={estilos.cuenta}>
        <View style={estilos.avatar}>
          <Text style={estilos.avatarTexto}>{usuario.nombre.trim().charAt(0).toUpperCase()}</Text>
        </View>
        <View style={estilos.flex}>
          <Text style={estilos.nombre}>{usuario.nombre}</Text>
          <Text style={estilos.texto}>{usuario.email}</Text>
        </View>
      </View>
      <Boton titulo={t('perfil.cerrarSesion')} variante="borde" onPress={onSalir} estilo={estilos.boton} />
    </Tarjeta>
  )
}

// Ley 21.719: una acción abierta a la vez; cada una pide la contraseña actual
function MisDatos({ usuario }) {
  const { t, idioma } = useIdioma()
  const { corregirDatos, eliminarCuenta } = useSesion()
  const [accion, setAccion] = useState(null) // null | 'corregir' | 'descargar' | 'eliminar'
  const [datos, setDatos] = useState({ nombre: usuario.nombre, email: usuario.email, password: '' })
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  const cambiar = (campo) => (valor) => setDatos((actual) => ({ ...actual, [campo]: valor }))
  const abrir = (nueva) => {
    setAccion(accion === nueva ? null : nueva)
    setDatos({ nombre: usuario.nombre, email: usuario.email, password: '' })
    setIntentado(false)
    setError(null)
    setExito(null)
  }

  const { valido, errores } = accion === 'corregir' ? validarCorreccion(datos) : validarContrasena(datos)
  const errorDe = (campo) => (intentado && errores[campo] ? t(errores[campo]) : null)

  const ejecutar = async (tarea) => {
    setIntentado(true)
    setError(null)
    if (!valido) return
    setEnviando(true)
    try {
      await tarea()
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  const corregir = () =>
    ejecutar(async () => {
      await corregirDatos({ ...datos, idioma })
      setAccion(null)
      setExito(t('perfil.corregidos'))
    })

  const descargar = () =>
    ejecutar(async () => {
      const mios = await api.descargarDatos(usuario.id, datos.password)
      setAccion(null)
      // Share entrega el JSON al sistema: el usuario lo guarda o lo envía donde quiera
      await Share.share({ title: t('perfil.tituloDescarga'), message: JSON.stringify(mios, null, 2) })
    })

  const eliminar = () => {
    setIntentado(true)
    if (!valido) return
    Alert.alert(t('perfil.eliminarConfirmar'), t('perfil.eliminarConfirmarTexto'), [
      { text: t('perfil.cancelar'), style: 'cancel' },
      { text: t('perfil.eliminarBoton'), style: 'destructive', onPress: () => ejecutar(() => eliminarCuenta(datos.password)) },
    ])
  }

  const campoPassword = (
    <Campo
      etiqueta={t('perfil.passwordActual')}
      value={datos.password}
      onChangeText={cambiar('password')}
      error={errorDe('password')}
      secureTextEntry
      autoCapitalize="none"
      maxLength={128}
    />
  )

  return (
    <Tarjeta>
      <Text style={estilos.seccion}>{t('perfil.misDatos')}</Text>
      <Text style={estilos.texto}>{t('perfil.misDatosTexto')}</Text>
      <Aviso texto={exito} tipo="exito" />
      <View style={estilos.acciones}>
        <Chip texto={t('perfil.corregir')} activo={accion === 'corregir'} onPress={() => abrir('corregir')} />
        <Chip texto={t('perfil.descargar')} activo={accion === 'descargar'} onPress={() => abrir('descargar')} />
        <Chip texto={t('perfil.eliminar')} activo={accion === 'eliminar'} onPress={() => abrir('eliminar')} />
      </View>

      {accion === 'corregir' ? (
        <View style={estilos.formulario}>
          <Campo etiqueta={t('perfil.nombre')} value={datos.nombre} onChangeText={cambiar('nombre')} error={errorDe('nombre')} maxLength={80} />
          <Campo
            etiqueta={t('perfil.email')}
            value={datos.email}
            onChangeText={cambiar('email')}
            error={errorDe('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={254}
          />
          {campoPassword}
          <Aviso texto={error ? mensajeDeError(error, t) : null} />
          <Boton titulo={t('perfil.guardarCambios')} variante="secundario" onPress={corregir} cargando={enviando} estilo={estilos.boton} />
        </View>
      ) : null}

      {accion === 'descargar' ? (
        <View style={estilos.formulario}>
          <Text style={estilos.texto}>{t('perfil.descargarAyuda')}</Text>
          {campoPassword}
          <Aviso texto={error ? mensajeDeError(error, t) : null} />
          <Boton titulo={t('perfil.descargarBoton')} variante="secundario" onPress={descargar} cargando={enviando} estilo={estilos.boton} />
        </View>
      ) : null}

      {accion === 'eliminar' ? (
        <View style={estilos.formulario}>
          <Text style={estilos.texto}>{t('perfil.eliminarAyuda')}</Text>
          {campoPassword}
          <Aviso texto={error ? mensajeDeError(error, t) : null} />
          <Boton titulo={t('perfil.eliminarBoton')} variante="borde" onPress={eliminar} cargando={enviando} estilo={estilos.boton} />
        </View>
      ) : null}
    </Tarjeta>
  )
}

function Acceso() {
  const { t, idioma } = useIdioma()
  const { iniciarSesion, registrarse } = useSesion()
  const [modo, setModo] = useState('entrar') // 'entrar' | 'registro'
  const [datos, setDatos] = useState({ nombre: '', email: '', password: '', password2: '' })
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const cambiar = (campo) => (valor) => setDatos((actual) => ({ ...actual, [campo]: valor }))
  const { valido, errores } = modo === 'entrar' ? validarLogin(datos) : validarRegistro(datos)
  const errorDe = (campo) => (intentado && errores[campo] ? t(errores[campo]) : null)

  const cambiarModo = (nuevo) => {
    setModo(nuevo)
    setIntentado(false)
    setError(null)
  }

  const enviar = async () => {
    setIntentado(true)
    setError(null)
    if (!valido) return
    setEnviando(true)
    try {
      if (modo === 'entrar') await iniciarSesion(datos)
      else await registrarse({ ...datos, idioma })
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tarjeta>
      <View style={estilos.modos}>
        <Chip texto={t('perfil.iniciarSesion')} activo={modo === 'entrar'} onPress={() => cambiarModo('entrar')} />
        <Chip texto={t('perfil.crearCuenta')} activo={modo === 'registro'} onPress={() => cambiarModo('registro')} />
      </View>
      {modo === 'registro' ? (
        <Campo etiqueta={t('perfil.nombre')} value={datos.nombre} onChangeText={cambiar('nombre')} error={errorDe('nombre')} maxLength={80} autoComplete="name" />
      ) : null}
      <Campo
        etiqueta={t('perfil.email')}
        value={datos.email}
        onChangeText={cambiar('email')}
        error={errorDe('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        maxLength={254}
      />
      <Campo
        etiqueta={t('perfil.password')}
        value={datos.password}
        onChangeText={cambiar('password')}
        error={errorDe('password')}
        secureTextEntry
        autoCapitalize="none"
        maxLength={128}
      />
      {modo === 'registro' ? (
        <Campo
          etiqueta={t('perfil.password2')}
          value={datos.password2}
          onChangeText={cambiar('password2')}
          error={errorDe('password2')}
          secureTextEntry
          autoCapitalize="none"
          maxLength={128}
        />
      ) : null}
      <Aviso texto={error ? mensajeDeError(error, t) : null} />
      <Boton
        titulo={modo === 'entrar' ? t('perfil.entrar') : t('perfil.registrarme')}
        variante="secundario"
        onPress={enviar}
        cargando={enviando}
        estilo={estilos.boton}
      />
    </Tarjeta>
  )
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 32 },
  cuerpo: { padding: 20, gap: 16 },
  modos: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  cuenta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.crema,
    borderWidth: 2,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontSize: 22, fontWeight: '800', color: colores.azul },
  nombre: { fontSize: 17, fontWeight: '800', color: colores.azul },
  seccion: { fontSize: 16, fontWeight: '800', color: colores.azul },
  texto: { fontSize: 13, color: colores.gris, marginTop: 4, lineHeight: 19 },
  aviso: { fontSize: 12, color: colores.gris, marginTop: 10, fontStyle: 'italic' },
  boton: { marginTop: 16 },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  formulario: { marginTop: 12 },
})
