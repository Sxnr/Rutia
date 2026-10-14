import { z } from 'zod'

// Capa Servidor: Validación (Zod) - Arquitectura_técnica.md
// Router -> Validator -> Controller
export const preferenciasSchema = z.object({
  tiempo: z.number().min(1).max(8),
  presupuesto: z.number().min(1000).max(200000),
  intereses: z.array(z.string()).min(1, "Selecciona al menos 1 interés"),
})

export function validarPreferencias(data) {
  return preferenciasSchema.safeParse(data)
}
