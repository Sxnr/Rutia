// Utilidad de depuración (compartida por cliente y servidor del prototipo).
// Se activa agregando ?debug=1 a la URL. No hace nada en modo normal.
let activo = false
if (typeof window !== 'undefined') {
  activo = /[?&]debug=1\b/.test(window.location.search)
}

export function debugActivo() {
  return activo
}

// Imprime un paso del flujo por capas en la consola del navegador.
export function logPaso(n, capa, mensaje, detalle) {
  if (!activo) return
  const estilo = 'color:#E0A526;font-weight:bold;font-size:11px'
  console.log(`%c[RUTIA · debug] Paso ${n} — ${capa}: ${mensaje}`, estilo, detalle ?? '')
}
