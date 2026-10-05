import { Skeleton } from '@/components/ui/skeleton';

/** Carga genérica: barra + filas (design/screens/13-estados.html). */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Cargando" className="flex flex-col gap-4 px-4 pt-6 md:px-8 md:pt-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-16 rounded-[18px] md:h-[84px] md:rounded-[22px]" />
      <div className="flex flex-col gap-2.5">
        {['w-3/5', 'w-1/2', 'w-2/3', 'w-2/5', 'w-1/2'].map((w, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-line-card bg-surface p-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <span className="flex flex-1 flex-col gap-2">
              <Skeleton className={`h-3 ${w}`} />
              <Skeleton className="h-2.5 w-2/5" />
            </span>
            <Skeleton className="size-11 shrink-0 rounded-xl" />
          </div>
        ))}
      </div>
    </main>
  );
}
