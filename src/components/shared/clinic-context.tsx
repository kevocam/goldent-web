'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface ClinicSession {
  clinicId: string;
  staffName: string;
}

const ClinicContext = createContext<ClinicSession | null>(null);

/** Clínica del usuario logueado; la usa la subida de fotos para armar la ruta en Storage. */
export function ClinicProvider({ value, children }: { value: ClinicSession; children: ReactNode }) {
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicSession {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic debe usarse dentro de <ClinicProvider>');
  return ctx;
}
