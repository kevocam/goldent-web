'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { fullName } from '@/lib/format';
import { patientSchema, quickCaptureSchema, type PatientFormValues, type QuickCaptureValues } from '@/lib/schemas/patient';
import type { ActionResult } from '@/types/domain';
import { dbErrorMessage, fieldErrors } from './errors';

type Created = { id: string; record_number: string };

/** F04 · Alta de paciente con antecedentes. */
export async function createPatient(input: PatientFormValues): Promise<ActionResult<Created>> {
  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };
  const { conditions, ...patient } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.from('patients').insert(patient).select('id, record_number').single();
  if (error) return { ok: false, error: dbErrorMessage(error) };

  const active = conditions.filter((c) => c.active);
  if (active.length) {
    const { error: e2 } = await supabase.from('patient_conditions').insert(
      active.map((c) => ({ patient_id: data.id, condition_id: c.conditionId, detail: c.detail ?? null, active: true })),
    );
    if (e2) return { ok: false, error: `Paciente guardado (${data.record_number}), pero no sus antecedentes. Edítalo para completarlos.` };
  }

  revalidatePath('/');
  return { ok: true, data };
}

/** F04 · Edición. Un antecedente desactivado queda con active=false (no se borra). */
export async function updatePatient(id: string, input: PatientFormValues): Promise<ActionResult> {
  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };
  const { conditions, ...patient } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from('patients').update(patient).eq('id', id);
  if (error) return { ok: false, error: dbErrorMessage(error) };

  const { data: existing } = await supabase.from('patient_conditions').select('condition_id').eq('patient_id', id);
  const known = new Set((existing ?? []).map((e) => e.condition_id));
  // Solo se escriben los que existen o los nuevos activos: no se crean filas "No".
  const rows = conditions
    .filter((c) => c.active || known.has(c.conditionId))
    .map((c) => ({ patient_id: id, condition_id: c.conditionId, active: c.active, detail: c.active ? (c.detail ?? null) : null }));

  if (rows.length) {
    const { error: e2 } = await supabase.from('patient_conditions').upsert(rows, { onConflict: 'patient_id,condition_id' });
    if (e2) return { ok: false, error: dbErrorMessage(e2) };
  }

  revalidatePath(`/pacientes/${id}`);
  revalidatePath('/');
  return { ok: true, data: undefined };
}

/** Archivar (soft delete): desaparece del buscador; nada se borra. */
export async function archivePatient(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('patients').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return { ok: false, error: dbErrorMessage(error) };
  revalidatePath('/');
  return { ok: true, data: undefined };
}

/** F05 · Captura rápida: 4 datos + N.º en papel. Las fotos se suben después desde el cliente. */
export async function quickCapture(input: QuickCaptureValues): Promise<ActionResult<Created>> {
  const parsed = quickCaptureSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.from('patients').insert(parsed.data).select('id, record_number').single();
  if (error) return { ok: false, error: dbErrorMessage(error) };

  revalidatePath('/');
  return { ok: true, data };
}

/** F05 · Deshacer la última captura: archiva paciente y archivos. */
export async function undoQuickCapture(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from('patients').update({ deleted_at: now }).eq('id', id);
  if (error) return { ok: false, error: dbErrorMessage(error) };
  await supabase.from('files').update({ deleted_at: now }).eq('patient_id', id);
  revalidatePath('/');
  return { ok: true, data: undefined };
}

/** Verificación en vivo de DNI duplicado (F04, F05). */
export async function findPatientByDni(
  dni: string,
  excludeId?: string,
): Promise<{ id: string; name: string; record_number: string } | null> {
  if (!/^\d{8}$/.test(dni)) return null;
  const supabase = await createClient();
  let query = supabase.from('patients').select('id, first_names, last_names, record_number').eq('dni', dni).is('deleted_at', null);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query.limit(1).maybeSingle();
  return data ? { id: data.id, name: fullName(data), record_number: data.record_number } : null;
}
