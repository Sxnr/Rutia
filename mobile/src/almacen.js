// Guarda datos pequeños en el teléfono (sesión e idioma).
// En Android/iOS usa expo-secure-store (cifrado). En web, localStorage.
// Si algo falla, la app sigue funcionando: solo no recuerda el dato.
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const esWeb = Platform.OS === 'web'

export async function leer(clave) {
  try {
    return esWeb ? globalThis.localStorage?.getItem(clave) ?? null : await SecureStore.getItemAsync(clave)
  } catch {
    return null
  }
}

export async function guardar(clave, valor) {
  try {
    if (esWeb) globalThis.localStorage?.setItem(clave, valor)
    else await SecureStore.setItemAsync(clave, valor)
  } catch {
    // sin almacenamiento disponible: se ignora
  }
}

export async function borrar(clave) {
  try {
    if (esWeb) globalThis.localStorage?.removeItem(clave)
    else await SecureStore.deleteItemAsync(clave)
  } catch {
    // sin almacenamiento disponible: se ignora
  }
}
