import { Skeleton } from '@/components/ui/skeleton';

/** Carga de la agenda: barra de navegación + filas de citas. */
export default function AgendaLoading() {
  return (
    <main aria-busy="true" aria-label="Cargando agenda" className="flex flex-col gap-5 px-4 pt-6 md:px-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mx-auto hidden h-11 w-72 md:block" />
        <Skeleton className="ml-auto h-12 w-40 rounded-[14px]" />
      </div>
      <div className="flex flex-col gap-2.5 md:max-w-[calc(100%-440px)]">
        {['w-3/5', 'w-1/2', 'w-2/3', 'w-2/5'].map((w, i) => (
          <div key={i} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3">
            <Skeleton className="mt-4 ml-auto h-4 w-11" />
            <div className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-line-card bg-surface px-4">
              <span className="flex flex-1 flex-col gap-2">
                <Skeleton className={`h-3 ${w}`} />
                <Skeleton className="h-2.5 w-2/5" />
              </span>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
