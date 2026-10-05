'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { visitSchema, type VisitRawInput } from '@/lib/schemas/visit';
import type { ActionResult, TreatmentStatus } from '@/types/domain';
import { dbErrorMessage, fieldErrors } from './errors';

/**
 * F06 · Guarda la visita y sus tratamientos.
 * Un tratamiento con varias piezas → una fila por pieza (D-05). Boca completa → tooth null.
 */
export async function createVisit(patientId: string, input: VisitRawInput): Promise<ActionResult<{ id: string; count: number }>> {
  const parsed = visitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Revisa los datos de la visita.', fieldErrors: fieldErrors(parsed.error) };
  const { treatments, ...visit } = parsed.data;

  const supabase = await createClient();

  // El servicio que requiere pieza debe traer pieza o boca completa.
  const serviceIds = [...new Set(treatments.map((t) => t.serviceId))];
  if (serviceIds.length) {
    const { data: services } = await supabase.from('services').select('id, name, requires_tooth').in('id', serviceIds);
    const needsTooth = new Map((services ?? []).map((s) => [s.id, s]));
    const missing = treatments.find((t) => needsTooth.get(t.serviceId)?.requires_tooth && !t.wholeMouth && t.teeth.length === 0);
    if (missing) return { ok: false, error: `Elige la pieza para "${needsTooth.get(missing.serviceId)?.name}".` };
  }

  const { data: created, error } = await supabase
    .from('visits')
    .insert({ ...visit, patient_id: patientId })
    .select('id')
    .single();
  if (error) return { ok: false, error: dbErrorMessage(error) };

  const rows = treatments.flatMap((t) =>
    (t.wholeMouth || t.teeth.length === 0 ? [null] : t.teeth).map((tooth) => ({
      patient_id: patientId,
      visit_id: created.id,
      service_id: t.serviceId,
      tooth,
      status: t.status,
      notes: t.notes || null,
    })),
  );

  if (rows.length) {
    const { error: e2 } = await supabase.from('treatments').insert(rows);
    if (e2) {
      // Sin transacciones desde el cliente: se archiva la visita a medias para no dejar basura.
      await supabase.from('visits').update({ deleted_at: new Date().toISOString() }).eq('id', created.id);
      return { ok: false, error: dbErrorMessage(e2) };
    }
  }

  revalidatePath(`/pacientes/${patientId}`);
  revalidatePath('/');
  return { ok: true, data: { id: created.id, count: rows.length } };
}

/** Ficha · Visitas: cambiar estado de un tratamiento (ej. En proceso → Realizado). */
export async function updateTreatmentStatus(id: string, patientId: string, status: TreatmentStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('treatments').update({ status }).eq('id', id);
  if (error) return { ok: false, error: dbErrorMessage(error) };
  revalidatePath(`/pacientes/${patientId}`);
  return { ok: true, data: undefined };
}
