'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { usePatientSearch } from '@/hooks/use-patient-search';
import type { PatientCard } from '@/types/domain';
import { PatientSearchBox } from './patient-search-box';
import { SearchResults } from './search-results';

export interface HomeSearchProps {
  /** Lista "Recientes" (render del servidor). */
  recent: ReactNode;
  /** Tarjeta lateral "Citas de hoy". */
  aside?: ReactNode;
  initialQuery?: string;
  initialResults?: PatientCard[];
}

/**
 * Buscador de Inicio. La consulta vive en ?q= para que "atrás" desde la ficha
 * conserve los resultados.
 */
export function HomeSearch({ recent, aside, initialQuery = '', initialResults = [] }: HomeSearchProps) {
  const [q, setQ] = useState(initialQuery);
  const search = usePatientSearch(q, { query: initialQuery.trim(), results: initialResults });

  const onChange = (value: string) => {
    setQ(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  };

  const hasQuery = q.trim().length >= 2;
  const settled = search.query === q.trim() && !search.loading;

  return (
    <>
      <PatientSearchBox value={q} onChange={onChange} loading={search.loading} />

      {!hasQuery ? (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
          {recent}
          <div className="hidden md:block">{aside}</div>
        </div>
      ) : search.error ? (
        <p role="alert" className="m-0 text-base font-bold text-alert">
          {search.error}
        </p>
      ) : settled ? (
        <SearchResults query={search.query} results={search.results} />
      ) : null}

      <Link
        href="/pacientes/nuevo"
        aria-label="Nuevo paciente"
        className="fixed right-5 bottom-28 z-20 flex size-16 items-center justify-center rounded-[20px] bg-gold-700 text-white shadow-[0_10px_24px_rgba(138,101,18,.35)] md:hidden"
      >
        <Plus className="size-8" aria-hidden />
      </Link>
    </>
  );
}
