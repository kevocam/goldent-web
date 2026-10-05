import { z } from 'zod';
import { isISODate } from '@/lib/agenda';

/** F08 · Crear o reprogramar una cita. Fecha y hora siempre en hora de Lima. */
export const appointmentSchema = z.object({
  patient_id: z.string().uuid('Elige un paciente'),
  date: z.string().refine(isISODate, 'Fecha no válida'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora no válida'),
  duration: z.number().int().min(10, 'Mínimo 10 minutos').max(480, 'Máximo 8 horas'),
  reason: z
    .string()
    .trim()
    .max(200, 'Máximo 200 caracteres')
    .transform((v) => (v === '' ? null : v)),
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v ? v : null)),
});

export type AppointmentInput = z.output<typeof appointmentSchema>;
export type AppointmentRawInput = z.input<typeof appointmentSchema>;

export const appointmentStatusSchema = z.enum(['scheduled', 'confirmed', 'done', 'cancelled', 'no_show']);
