import { Skeleton } from '@/components/ui/skeleton';

/** Esqueleto de la ficha: encabezado + tarjetas. */
export default function PatientLoading() {
  return (
    <main aria-busy="true" aria-label="Cargando ficha" className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3 border-b border-line-card bg-surface px-4 pt-4 pb-4 md:px-8">
        <Skeleton className="h-5 w-28" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full md:size-16" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-2/3 md:w-80" />
            <Skeleton className="h-4 w-1/2 md:w-96" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <div className="flex gap-6 pt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>
      </div>
      <div className="grid gap-5 px-4 py-5 md:grid-cols-[1.4fr_1fr] md:px-8">
        <Skeleton className="h-60 rounded-[20px]" />
        <Skeleton className="h-40 rounded-[20px]" />
      </div>
    </main>
  );
}
