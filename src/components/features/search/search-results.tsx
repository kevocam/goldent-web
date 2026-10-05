import { SearchX, UserPlus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { PatientRow } from '@/components/shared/patient-row';
import { digits } from '@/lib/format';
import type { PatientCard } from '@/types/domain';

/** Prellenado de "Crear paciente" según lo que se buscó (F02). */
export function newPatientHref(q: string): string {
  const d = digits(q);
  const clean = q.trim();
  if (d.length === clean.replace(/\s/g, '').length && d.length > 0) {
    return `/pacientes/nuevo?${d.length === 8 ? 'dni' : 'celular'}=${d}`;
  }
  return `/pacientes/nuevo?nombre=${encodeURIComponent(clean)}`;
}

export function SearchResults({ query, results }: { query: string; results: PatientCard[] }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={`No encontramos “${query}”`}
        description="Revisa cómo está escrito o busca por DNI o celular. Si es un paciente nuevo, regístralo ahora."
        className="md:max-h-[420px] md:flex-1"
        actions={
          <>
            <ButtonLink href={newPatientHref(query)}>
              <UserPlus className="size-5" aria-hidden />
              Crear paciente
            </ButtonLink>
            <ButtonLink href="/captura" variant="secondary">
              Es una historia en papel
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <section className="flex flex-col gap-3" aria-live="polite">
      <h2 className="m-0 text-sm font-bold text-ink-muted md:text-base">
        {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para “{query}”
      </h2>
      <div className="flex flex-col gap-3 md:gap-2">
        {results.map((p) => (
          <PatientRow key={p.id} patient={p} href={`/pacientes/${p.id}`} variant="result" />
        ))}
      </div>
    </section>
  );
}
