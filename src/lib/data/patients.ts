import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { alertLabel } from '@/lib/alerts';
import type { Patient, PatientCard, PatientCondition } from '@/types/domain';

/** Inicio · Recientes */
export async function getRecentPatients(limit = 6): Promise<PatientCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('recent_patients', { max_results: limit });
  if (error) throw error;
  return (data ?? []) as unknown as PatientCard[];
}

/** Inicio con ?q= (render inicial en servidor; luego busca el cliente). */
export async function searchPatients(q: string, limit = 20): Promise<PatientCard[]> {
  if (q.trim().length < 2) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('search_patients', { q, max_results: limit });
  if (error) throw error;
  return (data ?? []) as unknown as PatientCard[];
}

/** Paciente no archivado. null → 404. */
export const getPatient = cache(async (id: string): Promise<Patient | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw error;
  return data;
});

/** Catálogo completo de antecedentes con el estado del paciente (vacío en alta). */
export const getPatientConditions = cache(async (patientId?: string): Promise<PatientCondition[]> => {
  const supabase = await createClient();
  const [{ data: catalog, error: e1 }, pcResult] = await Promise.all([
    supabase.from('conditions').select('id, code, label, sort_order').eq('active', true).order('sort_order'),
    patientId
      ? supabase.from('patient_conditions').select('condition_id, active, detail, updated_at').eq('patient_id', patientId)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (e1) throw e1;
  if (pcResult.error) throw pcResult.error;

  const byCondition = new Map((pcResult.data ?? []).map((pc) => [pc.condition_id, pc]));
  return (catalog ?? []).map((c) => {
    const pc = byCondition.get(c.id);
    return {
      conditionId: c.id,
      code: c.code,
      label: c.label,
      active: pc?.active ?? false,
      detail: pc?.detail ?? null,
      updatedAt: pc?.updated_at ?? null,
    };
  });
});

/** Alertas activas para el encabezado de la ficha y Nueva visita. */
export async function getPatientAlerts(patientId: string): Promise<string[]> {
  const conditions = await getPatientConditions(patientId);
  return conditions.filter((c) => c.active).map((c) => alertLabel(c.code, c.label, c.detail));
}

/** "HC-00253": vista previa del próximo número (solo informativo). */
export async function getNextRecordNumber(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from('clinics').select('record_seq').maybeSingle();
  const next = (data?.record_seq ?? 0) + 1;
  return `HC-${String(next).padStart(5, '0')}`;
}
