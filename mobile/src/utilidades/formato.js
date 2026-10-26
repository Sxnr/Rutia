// Formato de montos, duraciones y fechas para mostrar en pantalla.
// Se hace a mano (sin Intl) para que se vea igual en Android, iOS y web.

export function formatearPesos(valor, idioma = 'es') {
  const entero = Math.round(Number(valor) || 0)
  const separador = idioma === 'en' ? ',' : '.'
  const digitos = String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, separador)
  return `${entero < 0 ? '-' : ''}$${digitos}`
}

// 0 → "Gratis" / "Free"; el resto como monto
export function formatearCosto(valor, idioma, textoGratis) {
  return Number(valor) === 0 ? textoGratis : formatearPesos(valor, idioma)
}

// 221 → "3 h 41 min"; 45 → "45 min"; 120 → "2 h"
export function formatearDuracion(minutos) {
  const total = Math.max(0, Math.round(Number(minutos) || 0))
  const horas = Math.floor(total / 60)
  const resto = total % 60
  if (horas === 0) return `${resto} min`
  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}

// 4 → "4 h"; 4.5 → "4,5 h" (es) / "4.5 h" (en)
export function formatearHoras(horas, idioma = 'es') {
  const texto = String(horas)
  return `${idioma === 'es' ? texto.replace('.', ',') : texto} h`
}

// "2026-10-25T22:10:00Z" → "25-10-2026" (es) / "10/25/2026" (en), en la hora local del teléfono
export function formatearFecha(iso, idioma = 'es') {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const dd = String(fecha.getDate()).padStart(2, '0')
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const aaaa = fecha.getFullYear()
  return idioma === 'en' ? `${mm}/${dd}/${aaaa}` : `${dd}-${mm}-${aaaa}`
}
