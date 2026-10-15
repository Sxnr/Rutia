// Iconos SVG inline compartidos por la UI (algunos en uso, otros huérfanos pendientes de limpieza)

export const IconBell = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7-6 5-6 9a1.5 1.5 0 0 1-3 0c0-4-3-2-3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>)
export const IconSearch = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>)
export const IconStar = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="#E0A526" stroke="#E0A526"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)
export const IconClock = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)
// Nuevo: Explorar = Brújula
export const IconExplorar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.08 20.26 12 17.5 9.92 20.26 7.76 7.76 12 10.5 16.24 7.76" fill="currentColor" stroke="none" opacity="0.9"/>
    <circle cx="12" cy="12" r="2" fill="white" stroke="currentColor"/>
  </svg>
)
// Nuevo: Crear Ruta = Mapa con pin y ruta
export const IconCrearRuta = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <path d="M8 2 v16 M16 6 v16" strokeWidth="1.2"/>
    <circle cx="12" cy="11" r="2.5" fill="#E0A526" stroke="#142C50" strokeWidth="1.2"/>
    <path d="M12 13.5 L12 16" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
export const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6 M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
)
export const IconBookmark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
)
