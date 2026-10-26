// Idioma de la app (es | en), compartido por todas las pantallas.
// Al cambiarlo: se traducen los textos de la app, la API responde en ese idioma
// y se recuerda para la próxima vez.
import { getLocales } from 'expo-localization'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { guardar, leer } from '../almacen'
import { establecerIdiomaApi } from '../api'
import { IDIOMAS, TEXTOS, traducir } from '../i18n/traducir'

const CLAVE = 'rutia.idioma'
const Contexto = createContext(null)

function idiomaDelTelefono() {
  try {
    return getLocales()[0]?.languageCode === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

export function ProveedorIdioma({ children }) {
  const [idioma, setIdioma] = useState(() => {
    const inicial = idiomaDelTelefono()
    establecerIdiomaApi(inicial) // antes de que cualquier pantalla pida datos
    return inicial
  })

  const cambiarIdioma = useCallback((nuevo) => {
    if (!IDIOMAS.includes(nuevo)) return
    establecerIdiomaApi(nuevo)
    setIdioma(nuevo)
    guardar(CLAVE, nuevo)
  }, [])

  // Si el usuario eligió un idioma antes, se usa ese
  useEffect(() => {
    leer(CLAVE).then((guardado) => {
      if (IDIOMAS.includes(guardado)) {
        establecerIdiomaApi(guardado)
        setIdioma(guardado)
      }
    })
  }, [])

  const t = useCallback((clave, datos) => traducir(TEXTOS[idioma], clave, datos), [idioma])
  const valor = useMemo(() => ({ idioma, cambiarIdioma, t }), [idioma, cambiarIdioma, t])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useIdioma() {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useIdioma debe usarse dentro de ProveedorIdioma')
  return valor
}
