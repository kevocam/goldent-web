'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_DURATION, findOverlap, formatTime12, limaDate, limaTime, minutesOf, rangeOf, toTimestamp } from '@/lib/agenda';
import { appointmentSchema, appointmentStatusSchema, type AppointmentRawInput } from '@/lib/schemas/appointment';
import type { ActionResult, AppointmentStatus } from '@/types/domain';
import { dbErrorMessage, fieldErrors } from './errors';

/** Clave en fieldErrors que avisa de un cruce de horario (la UI ofrece "Agendar igual"). */
const OVERLAP = 'overlap';

function revalidate(patientId?: string) {
  revalidatePath('/agenda');
  revalidatePath('/');
  if (patientId) revalidatePath(`/pacientes/${patientId}`);
}

/** Busca otra cita activa del mismo día que se cruce con el horario pedido. */
async function overlapMessage(date: string, time: string, duration: number, excludeId?: string): Promise<string | null> {
  const supabase = await createClient();
  const range = rangeOf(date, date);
  const { data, error } = await supabase
    .from('appointments')
    .select('id, starts_at, ends_at, patient:patients(first_names, last_names)')
    .is('deleted_at', null)
    .not('status', 'in', '(cancelled,no_show)')
    .gte('starts_at', range.from)
    .lt('starts_at', range.to);
  if (error || !data) return null;

  type Row = { id: string; starts_at: string; ends_at: string | null; patient: { first_names: string; last_names: string } | null };
  const slots = (data as unknown as Row[]).map((r) => {
    const start = minutesOf(limaTime(r.starts_at));
    const end = r.ends_at && limaDate(r.ends_at) === date ? minutesOf(limaTime(r.ends_at)) : start + DEFAULT_DURATION;
    return { id: r.id, start, end, row: r };
  });
  const start = minutesOf(time);
  const hit = findOverlap(slots, start, start + duration, excludeId);
  if (!hit) return null;
  const who = hit.row.patient ? `${hit.row.patient.first_names.split(' ')[0]} ${hit.row.patient.last_names.split(' ')[0]}` : 'otro paciente';
  return `Se cruza con la cita de ${who} a las ${formatTime12(limaTime(hit.row.starts_at))}.`;
}

/**
 * F08 · Nueva cita. Si se cruza con otra devuelve fieldErrors.overlap;
 * con `allowOverlap` se agenda igual (la doctora decide).
 */
export async function createAppointment(input: AppointmentRawInput, opts: { allowOverlap?: boolean } = {}): Promise<ActionResult<{ id: string; date: string }>> {
  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los datos de la cita.', fieldErrors: fieldErrors(parsed.error) };
  const { patient_id, date, time, duration, reason, notes } = parsed.data;

  if (!opts.allowOverlap) {
    const overlap = await overlapMessage(date, time, duration);
    if (overlap) return { ok: false, error: overlap, fieldErrors: { [OVERLAP]: overlap } };
  }

  const startsAt = toTimestamp(date, time);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id,
      starts_at: startsAt,
      ends_at: new Date(Date.parse(startsAt) + duration * 60000).toISOString(),
      reason,
      notes,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: dbErrorMessage(error) };

  revalidate(patient_id);
  return { ok: true, data: { id: data.id, date } };
}

/** F08 · Reprogramar: cambia fecha, hora, duración y motivo. Vuelve a "Programada". */
export async function rescheduleAppointment(
  id: string,
  input: AppointmentRawInput,
  opts: { allowOverlap?: boolean } = {},
): Promise<ActionResult<{ id: string; date: string }>> {
  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los datos de la cita.', fieldErrors: fieldErrors(parsed.error) };
  const { patient_id, date, time, duration, reason, notes } = parsed.data;

  if (!opts.allowOverlap) {
    const overlap = await overlapMessage(date, time, duration, id);
    if (overlap) return { ok: false, error: overlap, fieldErrors: { [OVERLAP]: overlap } };
  }

  const startsAt = toTimestamp(date, time);
  const supabase = await createClient();
  const { error } = await supabase
    .from('appointments')
    .update({
      starts_at: startsAt,
      ends_at: new Date(Date.parse(startsAt) + duration * 60000).toISOString(),
      reason,
      notes,
      status: 'scheduled',
    })
    .eq('id', id)
    .neq('status', 'done');
  if (error) return { ok: false, error: dbErrorMessage(error) };

  revalidate(patient_id);
  return { ok: true, data: { id, date } };
}

/** F08 · Confirmada, Atendida, Cancelada, No asistió… con un toque. */
export async function setAppointmentStatus(id: string, patientId: string, status: AppointmentStatus): Promise<ActionResult> {
  const parsed = appointmentStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: 'Estado no válido.' };
  const supabase = await createClient();
  const { error } = await supabase.from('appointments').update({ status: parsed.data }).eq('id', id);
  if (error) return { ok: false, error: dbErrorMessage(error) };
  revalidate(patientId);
  return { ok: true, data: undefined };
}
