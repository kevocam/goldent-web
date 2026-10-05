import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { TreatmentWithService, VisitWithTreatments } from '@/types/domain';

const TREATMENT_COLUMNS =
  'id, clinic_id, patient_id, visit_id, service_id, tooth, status, notes, deleted_at, created_by, created_at, updated_at, service:services(id, name)';

/** Visitas con sus tratamientos, de la más reciente a la más antigua. */
export const getVisits = cache(async (patientId: string): Promise<VisitWithTreatments[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('visits')
    .select(`*, treatments(${TREATMENT_COLUMNS})`)
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;

  const visits = (data ?? []) as unknown as VisitWithTreatments[];
  return visits.map((v) => ({
    ...v,
    treatments: (v.treatments ?? [])
      .filter((t) => !t.deleted_at)
      .sort((a, b) => a.created_at.localeCompare(b.created_at)),
  }));
});

/** Planificados y en proceso (Resumen · Tratamientos pendientes). */
export function pendingTreatments(visits: VisitWithTreatments[]): TreatmentWithService[] {
  return visits.flatMap((v) => v.treatments).filter((t) => t.status !== 'done');
}
