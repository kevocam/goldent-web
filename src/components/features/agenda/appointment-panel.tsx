import { CalendarClock, MessageCircle, Stethoscope, X } from 'lucide-react';
import { ButtonAnchor, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MedicalAlerts } from '@/components/shared/medical-alerts';
import { PatientIdentity } from '@/components/shared/patient-identity';
import { agendaHref, durationLabel, formatTime12, reminderMessage, slotOf, timeFromMinutes } from '@/lib/agenda';
import { whatsappUrl } from '@/lib/contact';
import { fullName } from '@/lib/format';
import type { AgendaAppointment } from '@/types/domain';
import { AppointmentStatusPicker } from './appointment-status-picker';

export interface AppointmentPanelProps {
  appointment: AgendaAppointment;
  today: string;
}

/** F08 · Panel de la cita seleccionada: paciente, alertas, estado, recordatorio y acciones. */
export function AppointmentPanel({ appointment: a, today }: AppointmentPanelProps) {
  const { date, time, end, duration } = slotOf(a);
  const name = fullName(a.patient);
  const open = a.status === 'scheduled' || a.status === 'confirmed';
  const canRemind = open && date >= today;
  const canAttend = a.status !== 'done' && a.status !== 'cancelled';
  const message = reminderMessage({ firstName: a.patient.first_names.trim().split(/\s+/)[0] ?? '', date, time, today });

  return (
    <Card as="aside" aria-label={`Cita de ${name}`} className="flex flex-col gap-4 p-5 md:sticky md:top-6 md:p-[22px]">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="tabular text-sm font-bold text-ink-muted">
            {formatTime12(time)} – {formatTime12(timeFromMinutes(end))} · {durationLabel(duration)}
            {a.reason ? ` · ${a.reason}` : ''}
          </span>
          <h2 className="m-0 text-[21px] leading-tight font-extrabold tracking-[-.01em] md:text-[22px]">{name}</h2>
          <PatientIdentity patient={a.patient} layout="header" className="gap-x-3 md:text-sm" />
        </div>
        <ButtonLink variant="ghost" size="icon" href={agendaHref({ vista: 'dia', fecha: date })} aria-label="Cerrar detalle" replace scroll={false} className="-mt-2 -mr-2 text-ink-muted">
          <X className="size-6" aria-hidden />
        </ButtonLink>
      </div>

      {a.patient.alerts.length ? (
        <MedicalAlerts alerts={a.patient.alerts} />
      ) : (
        <p className="m-0 text-sm font-semibold text-ink-muted">Sin alertas registradas</p>
      )}

      <div className="flex flex-col gap-2.5">
        <span className="field-label">Estado de la cita</span>
        <AppointmentStatusPicker key={`${a.id}-${a.status}`} id={a.id} patientId={a.patient_id} status={a.status} />
      </div>

      {a.notes ? <p className="m-0 text-[15px] leading-relaxed font-medium text-ink-muted">{a.notes}</p> : null}

      {canRemind ? (
        <div className="flex flex-col gap-2.5">
          <span className="field-label">Recordatorio por WhatsApp</span>
          <p className="m-0 rounded-2xl rounded-bl-[4px] bg-ok-50 px-4 py-3.5 text-[15px] leading-relaxed font-medium text-ink">{message}</p>
          <ButtonAnchor
            variant="whatsapp"
            href={a.patient.phone ? whatsappUrl(a.patient.phone, message) : undefined}
            disabled={!a.patient.phone}
            target="_blank"
            rel="noopener noreferrer"
            title={a.patient.phone ? undefined : 'Sin celular registrado'}
          >
            <MessageCircle className="size-5" aria-hidden />
            {a.patient.phone ? 'Enviar recordatorio' : 'Sin celular registrado'}
          </ButtonAnchor>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2.5 border-t border-line-soft pt-4">
        {canAttend ? (
          <ButtonLink href={`/pacientes/${a.patient_id}/visitas/nueva?cita=${a.id}`} className="flex-1">
            <Stethoscope className="size-5" aria-hidden />
            Atender
          </ButtonLink>
        ) : null}
        <ButtonLink variant="secondary" href={`/pacientes/${a.patient_id}`} className="flex-1">
          Ver ficha
        </ButtonLink>
        {a.status !== 'done' ? (
          <ButtonLink variant="secondary" href={agendaHref({ vista: 'dia', fecha: date, cita: a.id, editar: a.id })} scroll={false} className="flex-1">
            <CalendarClock className="size-5" aria-hidden />
            Reprogramar
          </ButtonLink>
        ) : null}
      </div>
    </Card>
  );
}
