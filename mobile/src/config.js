// Dirección del backend que usa la app.
// 1) EXPO_PUBLIC_API_URL en mobile/.env, si existe.
// 2) Si no, la IP del computador que corre Expo (Expo Go en la misma wifi la conoce).
// 3) Último recurso: localhost (navegador o simulador de iOS en el mismo computador).
import Constants from 'expo-constants'

const PUERTO_BACKEND = 8000

function direccionPorDefecto() {
  const host = (Constants.expoConfig?.hostUri ?? '').split(':')[0]
  // En modo túnel (*.exp.direct) esa dirección no lleva al backend: hay que usar .env
  if (host && !host.endsWith('.exp.direct')) return `http://${host}:${PUERTO_BACKEND}/api/v1`
  return `http://localhost:${PUERTO_BACKEND}/api/v1`
}

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || direccionPorDefecto()).replace(/\/+$/, '')
