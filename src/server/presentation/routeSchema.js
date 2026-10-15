import { z } from 'zod'

// Capa Servidor: Validación (Zod) - Arquitectura_técnica.md
// Router -> Validator -> Controller
export const preferenciasSchema = z.object({
  tiempo: z.number().min(1, "Indica un tiempo de al menos 1 hora").max(8, "El tiempo máximo es de 8 horas"),
  presupuesto: z.number().min(1000, "El presupuesto debe ser al menos $1.000").max(200000, "El presupuesto máximo es de $200.000"),
  intereses: z.array(z.string()).min(1, "Selecciona al menos 1 interés"),
})

export function validarPreferencias(data) {
  return preferenciasSchema.safeParse(data)
}

// Esquema para el recálculo de una ruta ya armada (eliminar/reordenar/vaciar)
export const paradasSchema = z.object({
  paradas: z.array(z.object({ id: z.string().min(1) })),
})

export function validarParadas(data) {
  return paradasSchema.safeParse(data)
}
