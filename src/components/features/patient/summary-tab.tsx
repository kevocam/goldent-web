import Link from 'next/link';
import { CalendarPlus, ClipboardCheck } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';
import { TreatmentItem } from '@/components/shared/treatment-item';
import { FILE_KIND } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { toothLabel } from '@/lib/teeth';
import type { FileWithUrl, TreatmentWithService, VisitWithTreatments } from '@/types/domain';
import { FileThumbnail } from '../files/file-thumbnail';

export interface SummaryTabProps {
  patientId: string;
  lastVisit: VisitWithTreatments | null;
  pending: TreatmentWithService[];
  recentFiles: FileWithUrl[];
}

/** Ficha · Resumen: última visita, pendientes y archivos recientes. */
export function SummaryTab({ patientId, lastVisit, pending, recentFiles }: SummaryTabProps) {
  const base = `/pacientes/${patientId}`;

  if (!lastVisit && recentFiles.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        tone="gold"
        title="Sin visitas registradas"
        description="Cada visita guarda el motivo, los tratamientos por pieza y tus notas."
        actions={<ButtonLink href={`${base}/visitas/nueva`}>Registrar primera visita</ButtonLink>}
      />
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
  );
}
