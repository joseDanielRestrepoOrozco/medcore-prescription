import { z } from 'zod';

// Schema para medicamento individual
export const medicationSchema = z.object({
  name: z.string().min(1, 'El nombre del medicamento es requerido'),
  genericName: z.string().optional(),
  dosage: z.string().min(1, 'La dosificación es requerida'),
  frequency: z.string().min(1, 'La frecuencia es requerida'),
  duration: z.number().int().positive('La duración debe ser un número positivo'),
  durationType: z.enum(['días', 'semanas', 'meses'], {
    errorMap: () => ({ message: 'Tipo de duración inválido. Use: días, semanas o meses' }),
  }),
  administrationRoute: z.string().min(1, 'La vía de administración es requerida'),
  instructions: z.string().optional(),
});

// Schema para crear una prescripción
export const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'El ID del paciente es requerido'),
  appointmentId: z.string().optional(),
  diagnosticId: z.string().optional(),
  diagnosis: z.string().min(1, 'El diagnóstico es requerido'),
  observations: z.string().optional(),
  medications: z
    .array(medicationSchema)
    .min(1, 'Debe incluir al menos un medicamento'),
});

// Schema para actualizar status de prescripción
export const updatePrescriptionStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
});

// Schema para crear alergia de paciente
export const createAllergySchema = z.object({
  patientId: z.string().min(1, 'El ID del paciente es requerido'),
  allergyType: z.enum(['medicamento', 'alimento', 'ambiental'], {
    errorMap: () => ({ message: 'Tipo de alergia inválido' }),
  }),
  allergen: z.string().min(1, 'El alérgeno es requerido'),
  severity: z.enum(['leve', 'moderada', 'severa'], {
    errorMap: () => ({ message: 'Severidad inválida' }),
  }),
  reaction: z.string().optional(),
  diagnosedDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

// Tipos TypeScript inferidos
export type MedicationData = z.infer<typeof medicationSchema>;
export type CreatePrescriptionData = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionStatusData = z.infer<typeof updatePrescriptionStatusSchema>;
export type CreateAllergyData = z.infer<typeof createAllergySchema>;
