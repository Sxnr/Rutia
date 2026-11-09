// Busca un texto por su clave ("explorar.saludo") y reemplaza {variables}.
// No depende de React Native: se prueba con Node en pruebas/i18n.test.js.
import en from './en.js'
import es from './es.js'

export const TEXTOS = { es, en }
export const IDIOMAS = ['es', 'en']

export function traducir(diccionario, clave, datos = {}) {
  const valor = clave.split('.').reduce((nodo, parte) => (nodo == null ? undefined : nodo[parte]), diccionario)
  if (typeof valor !== 'string') return clave // clave inexistente: se ve en pantalla y se nota al tiro
  return valor.replace(/\{(\w+)\}/g, (marca, nombre) => (datos[nombre] !== undefined ? String(datos[nombre]) : marca))
}
