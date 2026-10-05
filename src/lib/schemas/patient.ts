import { z } from 'zod';
import { digits } from '@/lib/format';

const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();

export const dniSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos');

export const mobileSchema = z
  .string()
  .transform((v) => digits(v))
  .refine((v) => /^9\d{8}$/.test(v), 'El celular debe tener 9 dígitos y empezar con 9');

const optionalDni = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\d{8}$/.test(v), 'El DNI debe tener 8 dígitos')
  .transform((v) => (v === '' ? null : v));

const optionalMobile = z
  .string()
  .transform((v) => digits(v))
  .refine((v) => v === '' || /^9\d{8}$/.test(v), 'El celular debe tener 9 dígitos y empezar con 9')
  .transform((v) => (v === '' ? null : v));

export const conditionInputSchema = z.object({
  conditionId: z.string().uuid(),
  active: z.boolean(),
  detail: optionalText,
});

/** F04 · Nuevo / editar paciente */
export const patientSchema = z.object({
  first_names: z.string().trim().min(1, 'Ingresa los nombres'),
  last_names: z.string().trim().min(1, 'Ingresa los apellidos'),
  dni: dniSchema,
  birth_date: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(v) <= new Date()), 'Fecha no válida')
    .transform((v) => (v === '' ? null : v)),
  phone: mobileSchema,
  email: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo no válido')
    .transform((v) => (v === '' ? null : v)),
  address: optionalText,
  occupation: optionalText,
  marital_status: z.enum(['soltero', 'casado', 'conviviente', 'divorciado', 'viudo']).nullable(),
  conditions: z.array(conditionInputSchema),
});

export type PatientFormValues = z.input<typeof patientSchema>;
export type PatientInput = z.output<typeof patientSchema>;

/** F05 · Captura rápida: DNI y celular opcionales (D-06). */
export const quickCaptureSchema = z.object({
  first_names: z.string().trim().min(1, 'Ingresa los nombres'),
  last_names: z.string().trim().min(1, 'Ingresa los apellidos'),
  dni: optionalDni,
  phone: optionalMobile,
  legacy_record_number: optionalText,
});

export type QuickCaptureValues = z.input<typeof quickCaptureSchema>;
export type QuickCaptureInput = z.output<typeof quickCaptureSchema>;
