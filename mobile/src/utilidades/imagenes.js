// El backend arma la URL de cada foto con su PUBLIC_BASE_URL, que por defecto es
// http://localhost:8000. Desde un celular, "localhost" es el propio celular y la foto
// no carga. Si pasa eso, se cambia por el mismo servidor y puerto de la API.
// (Se usa una expresión regular y no la clase URL, que en React Native es incompleta.)

const PATRON_URL = /^(https?:)\/\/([^/:?#]+)(:\d+)?(.*)$/i
const LOCALES = ['localhost', '127.0.0.1']

export function urlImagen(url, apiUrl) {
  if (!url) return null
  const foto = PATRON_URL.exec(url)
  const api = PATRON_URL.exec(apiUrl || '')
  if (!foto || !api) return url
  const fotoEsLocal = LOCALES.includes(foto[2].toLowerCase())
  const apiEsLocal = LOCALES.includes(api[2].toLowerCase())
  if (!fotoEsLocal || apiEsLocal) return url
  return `${api[1]}//${api[2]}${api[3] || ''}${foto[4]}`
}
