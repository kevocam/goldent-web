'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoaderCircle, Search, TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chip, ChipGroup } from '@/components/ui/chip';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { MedicalAlerts } from '@/components/shared/medical-alerts';
import { PatientAvatar } from '@/components/shared/patient-identity';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { usePatientSearch } from '@/hooks/use-patient-search';
import { createAppointment, rescheduleAppointment } from '@/lib/actions/appointments';
import { DURATION_OPTIONS, agendaHref, dayTitle, durationLabel, formatTime12 } from '@/lib/agenda';
import { VISIT_REASONS } from '@/lib/constants';
import { formatPhone, fullName, recordDigits, shortName } from '@/lib/format';

export interface PickedPatient {
  id: string;
  first_names: string;
  last_names: string;
  record_number: string;
  phone: string | null;
  alerts: string[];
}

export interface AppointmentDialogProps {
  mode: 'create' | 'reschedule';
  /** URL a la que vuelve al cerrar (la misma agenda sin el diálogo). */
  closeHref: string;
  today: string;
  appointmentId?: string;
  patient: PickedPatient | null;
  date: string;
  time: string;
  duration: number;
  reason?: string | null;
  notes?: string | null;
}

const FORM_ID = 'appointment-form';

/** F08 · Nueva cita / Reprogramar. Se abre desde la URL (?nueva=1 o ?editar=id). */
export function AppointmentDialog(props: AppointmentDialogProps) {
  const { mode, closeHref, today, appointmentId } = props;
  const router = useRouter();
  const toast = useToast();
  const online = useOnlineStatus();

  const [patient, setPatient] = useState<PickedPatient | null>(props.patient);
  const [q, setQ] = useState('');
  const search = usePatientSearch(patient ? '' : q);
  const [date, setDate] = useState(props.date);
  const [time, setTime] = useState(props.time);
  const [duration, setDuration] = useState(String(props.duration));
  const [reason, setReason] = useState(props.reason ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overlap, setOverlap] = useState<string | null>(null);

  const close = () => router.replace(closeHref, { scroll: false });
  const durationOptions = [...new Set([...DURATION_OPTIONS.map(String), duration])]
    .map(Number)
    .sort((a, b) => a - b)
    .map((d) => ({ value: String(d), label: durationLabel(d) }));

  const save = async (allowOverlap = false) => {
    if (!patient) {
      setErrors({ patient_id: 'Elige un paciente' });
      return;
    }
    setSaving(true);
    setError(null);
    setErrors({});
    const input = { patient_id: patient.id, date, time, duration: Number(duration), reason, notes: props.notes ?? '' };
    const res =
      mode === 'create'
        ? await createAppointment(input, { allowOverlap })
        : await rescheduleAppointment(appointmentId!, input, { allowOverlap });
    setSaving(false);

    if (!res.ok) {
      if (res.fieldErrors?.overlap) {
        setOverlap(res.fieldErrors.overlap);
        return;
      }
      setOverlap(null);
      setError(res.error);
      setErrors(res.fieldErrors ?? {});
      return;
    }

    toast({
      title: mode === 'create' ? 'Cita agendada' : 'Cita reprogramada',
      description: `${shortName(patient)} · ${dayTitle(date, today)} · ${formatTime12(time)}`,
    });
    router.replace(agendaHref({ vista: 'dia', fecha: res.data.date, cita: res.data.id }), { scroll: false });
    router.refresh();
  };

  const results = search.query === q.trim() && !search.loading ? search.results.slice(0, 5) : [];

  return (
    <Dialog
      open
      onClose={close}
      title={mode === 'create' ? 'Nueva cita' : 'Reprogramar cita'}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving} disabled={!online}>
            {mode === 'create' ? 'Agendar cita' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void save(false);
        }}
        className="-mx-1 flex max-h-[calc(92dvh-190px)] flex-col gap-5 overflow-y-auto px-1 pb-1"
      >
        <div className="flex flex-col gap-2">
          <span className="field-label">Paciente *</span>
          {patient ? (
            <div className="flex items-center gap-3 rounded-2xl bg-bg px-3.5 py-3">
              <PatientAvatar patient={patient} size="md" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-base font-extrabold">{fullName(patient)}</span>
                <span className="tabular truncate text-[13px] font-semibold text-ink-muted">
                  HC {recordDigits(patient.record_number)}
                  {patient.phone ? ` · ${formatPhone(patient.phone)}` : ' · sin celular'}
                </span>
                <MedicalAlerts alerts={patient.alerts} size="sm" />
              </span>
              {mode === 'create' ? (
                <Button variant="ghost" size="sm" onClick={() => setPatient(null)}>
                  Cambiar
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <Input
                aria-label="Buscar paciente por nombre, DNI o celular"
                placeholder="Nombre, DNI o celular"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                invalid={Boolean(errors.patient_id)}
                autoFocus
                prefix={<Search className="size-5" aria-hidden />}
                suffix={
                  search.loading ? (
                    <LoaderCircle className="mr-2 size-5 animate-spin text-ink-muted" aria-hidden />
                  ) : q ? (
                    <Button variant="ghost" size="icon" aria-label="Borrar búsqueda" onClick={() => setQ('')} className="size-11">
                      <X className="size-5" aria-hidden />
                    </Button>
                  ) : null
                }
              />
              {errors.patient_id ? <span className="text-[13px] font-bold text-alert">{errors.patient_id}</span> : null}
              {results.length ? (
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Resultados">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setPatient(p)}
                        className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl border border-line-card bg-surface px-3 py-2 text-left hover:border-gold-500"
                      >
                        <PatientAvatar patient={p} size="sm" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[15px] font-extrabold">{fullName(p)}</span>
                          <span className="tabular truncate text-[13px] font-semibold text-ink-muted">
                            HC {recordDigits(p.record_number)}
                            {p.dni ? ` · DNI ${p.dni}` : ''}
                          </span>
                        </span>
                        <MedicalAlerts alerts={p.alerts} compact size="sm" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : q.trim().length >= 2 && search.query === q.trim() && !search.loading ? (
                <p className="m-0 text-sm font-semibold text-ink-muted">No encontramos “{q.trim()}”. Regístralo primero desde Pacientes.</p>
              ) : null}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha" htmlFor="appt-date" required error={errors.date}>
            <Input id="appt-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} invalid={Boolean(errors.date)} />
          </Field>
          <Field label="Hora" htmlFor="appt-time" required error={errors.time}>
            <Input id="appt-time" type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} invalid={Boolean(errors.time)} />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <span className="field-label">Duración</span>
          <ChipGroup label="Duración" options={durationOptions} value={duration} onChange={(v) => v && setDuration(v)} size="sm" />
        </div>

        <Field label="Motivo" htmlFor="appt-reason" error={errors.reason}>
          <Input id="appt-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej. Control, continuación de endodoncia" maxLength={200} />
          <div className="flex flex-wrap gap-2">
            {VISIT_REASONS.map((r) => (
              <Chip key={r} size="sm" selected={reason === r} onClick={() => setReason(r)}>
                {r}
              </Chip>
            ))}
          </div>
        </Field>

        {overlap ? (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-gold-100 bg-st-progress-bg px-4 py-3.5 text-st-progress-fg">
            <span className="flex items-start gap-2 text-[15px] font-bold">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
              {overlap}
            </span>
            <Button variant="secondary" size="sm" className="self-start" loading={saving} onClick={() => void save(true)}>
              Agendar igual
            </Button>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="m-0 text-[15px] font-bold text-alert">
            {error}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}
