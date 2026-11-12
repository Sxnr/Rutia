// Sesión del usuario: quién está conectado y cómo entrar o salir.
// TODO(Hito 3): guardar un token firmado en vez de los datos del usuario.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { borrar, guardar, leer } from '../almacen'
import { api } from '../api'

const CLAVE = 'rutia.usuario'
const Contexto = createContext(null)

export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true) // mientras se lee la sesión guardada

  useEffect(() => {
    leer(CLAVE)
      .then((texto) => {
        if (texto) setUsuario(JSON.parse(texto))
      })
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))
  }, [])

  const recordar = useCallback(async (datos) => {
    setUsuario(datos)
    await guardar(CLAVE, JSON.stringify(datos))
    return datos
  }, [])

  const iniciarSesion = useCallback(
    async ({ email, password }) => recordar(await api.iniciarSesion({ email: email.trim(), password })),
    [recordar],
  )

  const registrarse = useCallback(
    async ({ nombre, email, password, idioma }) =>
      recordar(await api.registrarse({ nombre: nombre.trim(), email: email.trim(), password, idioma })),
    [recordar],
  )

  const cerrarSesion = useCallback(async () => {
    setUsuario(null)
    await borrar(CLAVE)
  }, [])

  // Rectificación: la API devuelve el usuario corregido y se guarda como la sesión nueva
  const corregirDatos = useCallback(
    async ({ nombre, email, idioma, password }) =>
      recordar(await api.corregirDatos(usuario.id, { nombre: nombre.trim(), email: email.trim(), idioma, password })),
    [usuario, recordar],
  )

  // Supresión: si la API la confirma, la sesión se cierra
  const eliminarCuenta = useCallback(
    async (password) => {
      await api.eliminarCuenta(usuario.id, password)
      await cerrarSesion()
    },
    [usuario, cerrarSesion],
  )

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, registrarse, cerrarSesion, corregirDatos, eliminarCuenta }),
    [usuario, cargando, iniciarSesion, registrarse, cerrarSesion, corregirDatos, eliminarCuenta],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSesion() {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useSesion debe usarse dentro de ProveedorSesion')
  return valor
}
