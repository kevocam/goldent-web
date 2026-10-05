import { HomeHeader } from '@/components/features/search/home-header';
import { HomeSearch } from '@/components/features/search/home-search';
import { RecentPatients } from '@/components/features/search/recent-patients';
import { TodayAppointmentsCard } from '@/components/features/search/today-appointments-card';
import { getRecentPatients, searchPatients } from '@/lib/data/patients';
import { getStaffSession } from '@/lib/data/session';

/** F02 · Inicio y buscador. */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const [session, recent, initialResults] = await Promise.all([getStaffSession(), getRecentPatients(6), searchPatients(q)]);

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-6 md:gap-[22px] md:px-8 md:pt-7">
      <HomeHeader staffName={session?.staffName ?? ''} />
      <HomeSearch
        initialQuery={q}
        initialResults={initialResults}
        recent={<RecentPatients patients={recent} />}
        aside={<TodayAppointmentsCard />}
      />
    </main>
  );
}
