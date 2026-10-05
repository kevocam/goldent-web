'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

const OnlineContext = createContext<boolean>(true);

/** D-03: solo detecta la caída de red; no hay cola offline en el MVP. */
export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  return <OnlineContext.Provider value={online}>{children}</OnlineContext.Provider>;
}

export function useOnlineStatus(): boolean {
  return useContext(OnlineContext);
}
