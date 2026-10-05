import type { PostgrestError } from '@supabase/supabase-js';
import type { ZodError } from 'zod';

/** Traduce errores de Postgres/Supabase a mensajes para la doctora. */
export function dbErrorMessage(error: Pick<PostgrestError, 'code' | 'message'>): string {
  if (error.code === '23505' && error.message.includes('dni')) return 'Ya existe un paciente con ese DNI.';
  if (error.code === '23505') return 'Ese registro ya existe.';
  if (error.code === '23514') return 'Hay un dato con formato no válido.';
  if (error.code === '42501') return 'No tienes permiso para hacer esto.';
  if (error.message?.toLowerCase().includes('fetch')) return 'Sin conexión con el servidor. Inténtalo otra vez.';
  return 'No se pudo guardar. Inténtalo otra vez.';
}

/** { campo: primer mensaje } a partir de un error de zod. */
export function fieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
