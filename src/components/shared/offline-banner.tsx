'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

/** Aviso global cuando no hay red (D-03: sin guardado offline en el MVP). */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="alert"
      className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-gold-100 bg-st-progress-bg px-4 py-3.5 text-gold-900 md:mx-8"
    >
      <WifiOff className="mt-0.5 size-5 shrink-0" aria-hidden />
      <span className="flex flex-col gap-1">
        <span className="text-[15px] font-extrabold">Sin conexión</span>
        <span className="text-sm leading-snug font-semibold">
          Los cambios no se pueden guardar hasta que vuelva la señal. Lo que escribiste no se pierde.
        </span>
      </span>
    </div>
  );
}
