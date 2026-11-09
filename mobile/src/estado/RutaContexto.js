// Preferencias del formulario y la última ruta sugerida.
// Se comparten entre "Crear ruta" y "Ruta sugerida". La ruta la calcula el backend;
// aquí solo se guarda lo que respondió.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { api } from '../api'
import { useIdioma } from './IdiomaContexto'

export const PREFERENCIAS_INICIALES = {
  tiempoHoras: 4,
  presupuesto: 15000,
  intereses: [],
  incluirVisitados: false,
}

const Contexto = createContext(null)

export function ProveedorRuta({ children }) {
  const { idioma } = useIdioma()
  const [preferencias, setPreferencias] = useState(PREFERENCIAS_INICIALES)
  const [sugerida, setSugerida] = useState(null)
  const ultimaPeticion = useRef(null)

  const generar = useCallback(async (prefs, usuarioId) => {
    const peticion = { ...prefs, usuarioId: usuarioId ?? null }
    const resultado = await api.generarRuta(peticion)
    ultimaPeticion.current = peticion
    setSugerida(resultado)
    return resultado
  }, [])

  // Si cambia el idioma, se pide la misma ruta otra vez para traer los nombres traducidos
  const idiomaAnterior = useRef(idioma)
  useEffect(() => {
    if (idiomaAnterior.current === idioma) return
    idiomaAnterior.current = idioma
    if (ultimaPeticion.current) {
      api.generarRuta(ultimaPeticion.current).then(setSugerida).catch(() => {})
    }
  }, [idioma])

  const valor = useMemo(
    () => ({ preferencias, setPreferencias, sugerida, generar }),
    [preferencias, sugerida, generar],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useRuta() {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useRuta debe usarse dentro de ProveedorRuta')
  return valor
}
