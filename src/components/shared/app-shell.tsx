import type { ReactNode } from 'react';
import { OnlineStatusProvider } from '@/hooks/use-online-status';
import { Toaster } from '@/components/ui/toast';
import { BottomNav } from './bottom-nav';
import { ClinicProvider, type ClinicSession } from './clinic-context';
import { OfflineBanner } from './offline-banner';
import { SideNav } from './side-nav';

/** Marco de toda la app autenticada: navegación, conexión, toasts y clínica. */
export function AppShell({ session, children }: { session: ClinicSession; children: ReactNode }) {
  return (
    <ClinicProvider value={session}>
      <OnlineStatusProvider>
        <Toaster>
          <div className="flex min-h-dvh bg-bg">
            <SideNav staffName={session.staffName} />
            <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
              <OfflineBanner />
              {children}
            </div>
          </div>
          <BottomNav />
        </Toaster>
      </OnlineStatusProvider>
    </ClinicProvider>
  );
}
