'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { findPatientByDni } from '@/lib/actions/patients';
import { useDebounce } from '@/hooks/use-debounce';

export interface DuplicateMatch {
  id: string;
  name: string;
  record_number: string;
}

export interface DuplicateDniNoticeProps {
  dni: string;
  /** En edición, el propio paciente no cuenta como duplicado. */
  excludeId?: string;
  /** Avisa al formulario para bloquear el guardado. */
  onDuplicateChange?: (match: DuplicateMatch | null) => void;
}

/** Verificación en vivo: "No está registrado" o "Ya existe: … · HC" con enlace (F04, F05). */
export function DuplicateDniNotice({ dni, excludeId, onDuplicateChange }: DuplicateDniNoticeProps) {
  const debounced = useDebounce(dni.trim(), 350);
  const [state, setState] = useState<{ dni: string; match: DuplicateMatch | null } | null>(null);

  useEffect(() => {
    if (!/^\d{8}$/.test(debounced)) {
      setState(null);
      onDuplicateChange?.(null);
      return;
    }
    let cancelled = false;
    findPatientByDni(debounced, excludeId).then((match) => {
      if (cancelled) return;
      setState({ dni: debounced, match });
      onDuplicateChange?.(match);
    });
    return () => {
      cancelled = true;
    };
    // onDuplicateChange es estable por contrato (useCallback / setState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, excludeId]);

  if (!state || state.dni !== dni.trim()) return null;

  if (!state.match) {
    return (
      <span className="flex items-center gap-1.5 text-[13px] font-bold text-ok-700">
        <CircleCheck className="size-4" aria-hidden />
        No está registrado
      </span>
    );
  }

  return (
    <span role="alert" className="flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-alert">
      <CircleAlert className="size-4" aria-hidden />
      Ya existe:
      <Link href={`/pacientes/${state.match.id}`} className="text-alert underline">
        {state.match.name} · {state.match.record_number}
      </Link>
    </span>
  );
}
