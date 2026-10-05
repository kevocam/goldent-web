import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { rangeOf } from '@/lib/agenda';
import { alertLabel } from '@/lib/alerts';
import { ageFrom, todayISO } from '@/lib/format';
import type { AgendaAppointment, Appointment } from '@/types/domain';

/** Paciente embebido por la FK (clinic_id, patient_id) + antecedentes activos para las alertas. */
const COLUMNS = `id, patient_id, starts_at, ends_at, status, reason, notes,
  patient:patients(id, first_names, last_names, record_number, dni, phone, birth_date, deleted_at,
    patient_conditions(active, detail, condition:conditions(code, label, is_alert, sort_order)))`;

interface RawRow extends Pick<Appointment, 'id' | 'patient_id' | 'starts_at' | 'ends_at' | 'status' | 'reason' | 'notes'> {
  patient: {
    id: string;
    first_names: string;
    last_names: string;
    record_number: string;
    dni: string | null;
    phone: string | null;
    birth_date: string | null;
    deleted_at: string | null;
    patient_conditions: { active: boolean; detail: string | null; condition: { code: string; label: string; is_alert: boolean; sort_order: number } | null }[];
  } | null;
}

function toAgenda(rows: RawRow[]): AgendaAppointment[] {
  return rows
    .filter((r) => r.patient && !r.patient.deleted_at)
    .map(({ patient: p, ...a }) => ({
      ...a,
      patient: {
        id: p!.id,
        first_names: p!.first_names,
        last_names: p!.last_names,
        record_number: p!.record_number,
        dni: p!.dni,
        phone: p!.phone,
        age: ageFrom(p!.birth_date),
        alerts: (p!.patient_conditions ?? [])
          .filter((pc) => pc.active && pc.condition?.is_alert)
          .sort((x, y) => x.condition!.sort_order - y.condition!.sort_order)
          .map((pc) => alertLabel(pc.condition!.code, pc.condition!.label, pc.detail)),
      },
    }));
}

/** Citas (no archivadas) cuyo inicio cae entre `from` y el fin de `toInclusive`, ambos "YYYY-MM-DD" de Lima. */
export const getAppointments = cache(async (from: string, toInclusive: string): Promise<AgendaAppointment[]> => {
  const range = rangeOf(from, toInclusive);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select(COLUMNS)
    .is('deleted_at', null)
    .gte('starts_at', range.from)
    .lt('starts_at', range.to)
    .order('starts_at');
  if (error) throw error;
  return toAgenda((data ?? []) as unknown as RawRow[]);
});

/** Inicio · Citas de hoy. */
export async function getTodayAppointments(): Promise<AgendaAppointment[]> {
  const today = todayISO();
  return getAppointments(today, today);
}

/** Una cita por id (para reprogramar). */
export async function getAppointment(id: string): Promise<AgendaAppointment | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from('appointments').select(COLUMNS).eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw error;
  return data ? (toAgenda([data as unknown as RawRow])[0] ?? null) : null;
}

/** Ficha · Próxima cita: la primera programada o confirmada desde ahora. */
export async function getNextAppointment(patientId: string): Promise<AgendaAppointment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select(COLUMNS)
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .in('status', ['scheduled', 'confirmed'])
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(1);
  if (error) throw error;
  return toAgenda((data ?? []) as unknown as RawRow[])[0] ?? null;
}
