'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PatientCard } from '@/types/domain';
import { useDebounce } from './use-debounce';

export interface PatientSearchState {
  results: PatientCard[];
  loading: boolean;
  error: string | null;
  /** Consulta a la que corresponden los resultados. */
  query: string;
}

/**
 * Buscador en vivo (F02): debounce 250 ms, mínimo 2 caracteres,
 * descarta respuestas viejas si se sigue escribiendo.
 */
export function usePatientSearch(q: string, initial?: { query: string; results: PatientCard[] }): PatientSearchState {
  const debounced = useDebounce(q.trim(), 250);
  const [state, setState] = useState<PatientSearchState>({
    results: initial?.results ?? [],
    loading: false,
    error: null,
    query: initial?.query ?? '',
  });
  const requestId = useRef(0);

  useEffect(() => {
    if (debounced.length < 2) {
      setState({ results: [], loading: false, error: null, query: debounced });
      return;
    }
    if (initial && debounced === initial.query && requestId.current === 0) return;

    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    createClient()
      .rpc('search_patients', { q: debounced, max_results: 20 })
      .then(({ data, error }) => {
        if (id !== requestId.current) return;
        setState({
          results: error ? [] : ((data ?? []) as unknown as PatientCard[]),
          loading: false,
          error: error ? 'No pudimos buscar. Revisa la conexión.' : null,
          query: debounced,
        });
      });
    // initial solo siembra el primer render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return state;
}
