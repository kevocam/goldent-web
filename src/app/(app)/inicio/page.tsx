import { HomeHeader } from '@/components/features/search/home-header';
import { HomeSearch } from '@/components/features/search/home-search';
import { RecentPatients } from '@/components/features/search/recent-patients';
import { TodayAppointmentsCard } from '@/components/features/search/today-appointments-card';
import { getTodayAppointments } from '@/lib/data/appointments';
import { getRecentPatients, searchPatients } from '@/lib/data/patients';
import { getStaffSession } from '@/lib/data/session';
import { todayISO } from '@/lib/format';

/** F02 · Inicio y buscador. */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const [session, recent, initialResults, todayAppointments] = await Promise.all([
    getStaffSession(),
    getRecentPatients(6),
    searchPatients(q),
    // Si la agenda falla, Inicio (lo más importante) sigue funcionando.
    getTodayAppointments().catch(() => null),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-6 md:gap-[22px] md:px-8 md:pt-7">
      <HomeHeader staffName={session?.staffName ?? ''} />
      <HomeSearch
        initialQuery={q}
        initialResults={initialResults}
        recent={<RecentPatients patients={recent} />}
        aside={<TodayAppointmentsCard appointments={todayAppointments} today={todayISO()} />}
      />
    </main>
  );
}
