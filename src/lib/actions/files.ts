'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/domain';
import { dbErrorMessage } from './errors';

const registerSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  kind: z.enum(['paper_record', 'xray', 'photo', 'consent', 'other']),
  storage_path: z.string().min(10),
  mime_type: z.string().nullable(),
  size_bytes: z.number().int().nonnegative().nullable(),
  page_number: z.number().int().positive().nullable(),
  caption: z.string().trim().max(200).nullable(),
  visit_id: z.string().uuid().nullable().optional(),
});

export type RegisterFileInput = z.input<typeof registerSchema>;

/** Registra la metadata tras subir el binario directo a Storage desde el navegador. */
export async function registerFile(input: RegisterFileInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Datos del archivo no válidos.' };

  const supabase = await createClient();
  const { error } = await supabase.from('files').insert(parsed.data);
  if (error) return { ok: false, error: dbErrorMessage(error) };
  revalidatePath(`/pacientes/${parsed.data.patient_id}`);
  return { ok: true, data: undefined };
}

export async function archiveFile(id: string, patientId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('files').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return { ok: false, error: dbErrorMessage(error) };
  revalidatePath(`/pacientes/${patientId}`);
  return { ok: true, data: undefined };
}
