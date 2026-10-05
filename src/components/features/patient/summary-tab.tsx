import Link from 'next/link';
import { CalendarClock, CalendarPlus, ClipboardCheck, MessageCircle } from 'lucide-react';
import { ButtonAnchor, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';
import { AppointmentStatusPill } from '@/components/shared/status-pills';
import { TreatmentItem } from '@/components/shared/treatment-item';
import { agendaHref, dayTitle, formatTime12, reminderMessage, slotOf } from '@/lib/agenda';
import { FILE_KIND } from '@/lib/constants';
import { whatsappUrl } from '@/lib/contact';
import { formatDate, todayISO } from '@/lib/format';
import { toothLabel } from '@/lib/teeth';
import type { AgendaAppointment, FileWithUrl, TreatmentWithService, VisitWithTreatments } from '@/types/domain';
import { FileThumbnail } from '../files/file-thumbnail';

export interface SummaryTabProps {
  patientId: string;
  lastVisit: VisitWithTreatments | null;
  pending: TreatmentWithService[];
  recentFiles: FileWithUrl[];
  /** Próxima cita programada o confirmada (F08). */
  nextAppointment?: AgendaAppointment | null;
}

/** Ficha · Próxima cita: recordatorio por WhatsApp o "Agendar cita". */
export function NextAppointmentCard({ patientId, appointment }: { patientId: string; appointment: AgendaAppointment | null }) {
  if (!appointment) {
    return (
      <SectionCard title="Próxima cita">
        <p className="m-0 text-[15px] font-semibold text-ink-muted">Sin citas programadas.</p>
        <ButtonLink variant="secondary" href={agendaHref({ vista: 'dia', nueva: true, paciente: patientId })}>
          <CalendarPlus className="size-5" aria-hidden />
          Agendar cita
        </ButtonLink>
      </SectionCard>
    );
  }

  const today = todayISO();
  const { date, time } = slotOf(appointment);
  const message = reminderMessage({ firstName: appointment.patient.first_names.trim().split(/\s+/)[0] ?? '', date, time, today });
  const phone = appointment.patient.phone;

  return (
    <SectionCard title="Próxima cita">
      <Link
        href={agendaHref({ vista: 'dia', fecha: date, cita: appointment.id })}
        className="flex flex-col gap-1 text-ink no-underline"
      >
        <span className="text-lg font-extrabold md:text-xl">{dayTitle(date, today)}</span>
        <span className="text-[15px] font-semibold text-ink-muted">
          {formatTime12(time)}
          {appointment.reason ? ` · ${appointment.reason}` : ''}
        </span>
      </Link>
      <span className="self-start">
        <AppointmentStatusPill status={appointment.status} />
      </span>
      <div className="flex gap-2.5">
        <ButtonAnchor
          variant="whatsapp"
          href={phone ? whatsappUrl(phone, message) : undefined}
          disabled={!phone}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3.5 text-[15px]"
        >
          <MessageCircle className="size-5" aria-hidden />
          Recordatorio
        </ButtonAnchor>
        <ButtonLink
          variant="secondary"
          href={agendaHref({ vista: 'dia', fecha: date, cita: appointment.id, editar: appointment.id })}
          className="flex-1 px-3.5 text-[15px]"
        >
          <CalendarClock className="size-5" aria-hidden />
          Reprogramar
        </ButtonLink>
      </div>
    </SectionCard>
  );
}

/** Ficha · Resumen: última visita, pendientes y archivos recientes. */
export function SummaryTab({ patientId, lastVisit, pending, recentFiles, nextAppointment = null }: SummaryTabProps) {
  const base = `/pacientes/${patientId}`;

  if (!lastVisit && recentFiles.length === 0) {
    return (
      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-5">
        <EmptyState
          icon={CalendarPlus}
          tone="gold"
          title="Sin visitas registradas"
          description="Cada visita guarda el motivo, los tratamientos por pieza y tus notas."
          actions={<ButtonLink href={`${base}/visitas/nueva`}>Registrar primera visita</ButtonLink>}
        />
        <NextAppointmentCard patientId={patientId} appointment={nextAppointment} />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-5">
      <div className="flex flex-col gap-4 md:gap-5">
        {lastVisit ? (
          <SectionCard title="Última visita" meta={formatDate(lastVisit.visit_date)} action={{ label: 'Ver todas', href: `${base}?tab=visitas` }}>
            {lastVisit.reason ? <p className="m-0 text-[15px] font-bold md:text-[17px]">{lastVisit.reason}</p> : null}
            {lastVisit.treatments.map((t) => (
              <TreatmentItem key={t.id} name={t.service.name} toothText={toothLabel(t.tooth)} status={t.status} size="lg" />
            ))}
            {lastVisit.notes ? <p className="m-0 text-[15px] leading-relaxed font-medium text-ink-muted">{lastVisit.notes}</p> : null}
          </SectionCard>
        ) : null}

        <SectionCard title="Tratamientos pendientes">
          {pending.length ? (
            pending.map((t) => <TreatmentItem key={t.id} name={t.service.name} toothText={toothLabel(t.tooth)} status={t.status} size="lg" />)
          ) : (
            <p className="m-0 flex items-center gap-2 text-[15px] font-semibold text-ink-muted">
              <ClipboardCheck className="size-5" aria-hidden />
              No hay tratamientos pendientes.
            </p>
          )}
        </SectionCard>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        <NextAppointmentCard patientId={patientId} appointment={nextAppointment} />
        <SectionCard title="Archivos recientes" action={recentFiles.length ? { label: 'Ver todos', href: `${base}?tab=archivos` } : undefined}>
          {recentFiles.length ? (
            <div className="grid grid-cols-3 gap-2.5">
              {recentFiles.map((f) => (
                <Link key={f.id} href={`${base}?tab=archivos`} aria-label={`${FILE_KIND[f.kind].label}${f.caption ? `, ${f.caption}` : ''}`}>
                  <FileThumbnail file={f} className="h-[84px] rounded-xl" label={f.caption ?? FILE_KIND[f.kind].tag} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="m-0 text-[15px] font-semibold text-ink-muted">Sin archivos todavía.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
