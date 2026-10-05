import { z } from 'zod';
import { isValidFdi } from '@/lib/teeth';

/** Un tratamiento con varias piezas se guarda como una fila por pieza (D-05). */
export const draftTreatmentSchema = z.object({
  serviceId: z.string().uuid(),
  teeth: z.array(z.string().refine(isValidFdi, 'Pieza no válida')),
  wholeMouth: z.boolean(),
  status: z.enum(['planned', 'in_progress', 'done']),
  notes: z.string().trim().max(1000).optional(),
});

/** F06 · Nueva visita */
export const visitSchema = z.object({
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida'),
  reason: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
  notes: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v)),
  appointment_id: z.string().uuid().nullable().optional(),
  treatments: z.array(draftTreatmentSchema),
});

export type VisitInput = z.output<typeof visitSchema>;
export type VisitRawInput = z.input<typeof visitSchema>;
