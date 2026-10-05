'use client';

import { LoaderCircle, Search, X } from 'lucide-react';

export interface PatientSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  autoFocus?: boolean;
}

/** Buscador grande: 84 px en tablet, 64 px en móvil, borde dorado. */
export function PatientSearchBox({ value, onChange, loading, autoFocus = true }: PatientSearchBoxProps) {
  return (
    <label className="flex h-16 shrink-0 items-center gap-2.5 rounded-[18px] border-2 border-gold-500 bg-surface pr-2 pl-[18px] shadow-[0_10px_30px_rgba(17,17,17,.06)] md:h-[84px] md:gap-4 md:rounded-[22px] md:pr-3.5 md:pl-[26px]">
      {loading ? (
        <LoaderCircle className="size-6 shrink-0 animate-spin text-gold-700 md:size-7" aria-hidden />
      ) : (
        <Search className="size-6 shrink-0 text-gold-700 md:size-7" aria-hidden />
      )}
      <input
        type="search"
        aria-label="Buscar paciente por nombre, DNI o celular"
        placeholder="Buscar por nombre, DNI o celular"
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent text-xl font-bold text-ink outline-none [&::-webkit-search-cancel-button]:hidden md:text-2xl"
      />
      {value ? (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          onClick={() => onChange('')}
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-[14px] border-0 bg-surface-2 text-ink md:size-14 md:rounded-2xl"
        >
          <X className="size-6" aria-hidden />
        </button>
      ) : null}
    </label>
  );
}
