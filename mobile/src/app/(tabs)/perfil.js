// Perfil: iniciar sesión o crear cuenta; con sesión, datos del usuario, idioma y cerrar sesión.
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'

import { Aviso, Boton, Campo, Chip, Encabezado, Pantalla, Tarjeta } from '../../componentes/basicos'
import { SelectorIdioma } from '../../componentes/SelectorIdioma'
import { useIdioma } from '../../estado/IdiomaContexto'
import { useSesion } from '../../estado/SesionContexto'
import { colores } from '../../tema'
import { mensajeDeError } from '../../utilidades/errores'
import { validarLogin, validarRegistro } from '../../utilidades/validacion'

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
})
