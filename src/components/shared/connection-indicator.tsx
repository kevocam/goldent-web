'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/cn';

/** Barra lateral: verde "En línea" / naranja "Sin conexión". */
export function ConnectionIndicator() {
  const online = useOnlineStatus();
  return (
    <span
      role="status"
      className={cn('flex flex-col items-center gap-1.5 text-center text-[11px] font-bold', online ? 'text-ok-700' : 'text-warn')}
    >
      <span className={cn('size-2.5 rounded-full', online ? 'bg-ok' : 'bg-warn')} aria-hidden />
      {online ? 'En línea' : 'Sin conexión'}
    </span>
  );
}
