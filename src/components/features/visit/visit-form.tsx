'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { FormActions } from '@/components/shared/form-actions';
import { MedicalAlerts } from '@/components/shared/medical-alerts';
import { PageHeader } from '@/components/shared/page-header';
import { TreatmentItem } from '@/components/shared/treatment-item';
import { createVisit } from '@/lib/actions/visits';
import { VISIT_REASONS } from '@/lib/constants';
import { formatCompactDate, pluralize, todayISO } from '@/lib/format';
import { teethLabel } from '@/lib/teeth';
import type { DraftTreatment, Service } from '@/types/domain';
import { TreatmentBuilder } from './treatment-builder';

export interface VisitFormProps {
  patient: { id: string; name: string; shortName: string; record_number: string };
  alerts: string[];
  services: Pick<Service, 'id' | 'name' | 'category' | 'requires_tooth' | 'sort_order'>[];
  appointmentId?: string | null;
}

const FORM_ID = 'visit-form';

/** F06 · Fecha, motivo y tratamientos de la visita. */
export function VisitForm({ patient, alerts, services, appointmentId }: VisitFormProps) {
  const router = useRouter();
  const toast = useToast();
  const today = todayISO();
  const [visitDate, setVisitDate] = useState(today);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftTreatment[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const back = `/pacientes/${patient.id}`;
  const dirty = reason.trim() !== '' || notes.trim() !== '' || items.length > 0;
  const rows = items.reduce((n, t) => n + (t.wholeMouth ? 1 : t.teeth.length), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await createVisit(patient.id, {
      visit_date: visitDate,
      reason,
      notes,
      appointment_id: appointmentId ?? null,
      treatments: items.map(({ serviceId, teeth, wholeMouth, status, notes: n }) => ({ serviceId, teeth, wholeMouth, status, notes: n })),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast({
      title: 'Visita guardada',
      description: `${patient.shortName} · ${pluralize(res.data.count, 'tratamiento', 'tratamientos')}`,
      action: { label: 'Ver', href: `${back}?tab=visitas` },
    });
    router.push(`${back}?tab=visitas`);
    router.refresh();
  };

  const cancel = () => (dirty ? setConfirmCancel(true) : router.push(back));

  return (
    <>
      <PageHeader
        back={{ href: back, label: `${patient.name} · ${patient.record_number}` }}
        title="Nueva visita"
        actions={<FormActions form={FORM_ID} onCancel={cancel} submitLabel="Guardar visita" submitting={saving} className="hidden md:flex" />}
      >
        <MedicalAlerts alerts={alerts} size="sm" />
      </PageHeader>

      <form id={FORM_ID} onSubmit={submit} className="flex flex-col gap-[18px] px-4 py-5 md:px-8 md:pt-[22px] md:pb-8">
        {error ? (
          <p role="alert" className="m-0 rounded-[14px] bg-alert-50 px-4 py-3 text-[15px] font-bold text-alert">
            {error}
          </p>
        ) : null}

        <Card as="section" className="grid gap-6 p-5 md:grid-cols-[280px_minmax(0,1fr)] md:px-6 md:py-[22px]">
          <Field label="Fecha" htmlFor="visit-date">
            <Input
              id="visit-date"
              type="date"
              max={today}
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value || today)}
              className="tabular font-bold"
              aria-describedby="visit-date-text"
            />
            <span id="visit-date-text" className="text-[13px] font-bold text-ink-muted">
              {visitDate === today ? 'Hoy · ' : ''}
              {formatCompactDate(visitDate)}
            </span>
          </Field>
          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="field-label">
              Motivo de consulta
            </label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="¿Por qué viene hoy?" />
            <div className="flex flex-wrap gap-2">
              {VISIT_REASONS.map((r) => (
                <Chip key={r} size="sm" selected={reason === r} onClick={() => setReason(r)}>
                  {r}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        <Card as="section" className="flex flex-col gap-3 p-5 md:px-6">
          <h2 className="m-0 text-lg font-extrabold">Tratamientos de esta visita · {items.length}</h2>
          {items.length ? (
            items.map((t) => (
              <TreatmentItem
                key={t.key}
                name={t.serviceName}
                toothText={t.wholeMouth ? 'General' : teethLabel(t.teeth, false)}
                status={t.status}
                notes={t.notes}
                onRemove={() => setItems((list) => list.filter((x) => x.key !== t.key))}
                size="lg"
              />
            ))
          ) : (
            <p className="m-0 text-[15px] font-semibold text-ink-muted">Aún no agregas tratamientos. Elige uno abajo.</p>
          )}
          {rows > items.length ? (
            <p className="m-0 text-[13px] font-semibold text-ink-muted">Se guardará un registro por pieza: {rows} en total.</p>
          ) : null}
        </Card>

        <TreatmentBuilder services={services} onAdd={(t) => setItems((list) => [...list, t])} />

        <Card as="section" className="flex flex-col gap-2 p-5 md:px-6">
          <label htmlFor="visit-notes" className="field-label">
            Notas de la visita · opcional
          </label>
          <Textarea id="visit-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Indicaciones, próximos pasos…" />
        </Card>

        <FormActions onCancel={cancel} submitLabel="Guardar visita" submitting={saving} size="lg" className="md:justify-end" />
      </form>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => router.push(back)}
        title="¿Descartar la visita?"
        description="Los tratamientos que agregaste no se guardarán."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        tone="danger"
      />
    </>
  );
}
