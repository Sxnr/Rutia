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

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, registrarse, cerrarSesion }),
    [usuario, cargando, iniciarSesion, registrarse, cerrarSesion],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSesion() {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useSesion debe usarse dentro de ProveedorSesion')
  return valor
}
