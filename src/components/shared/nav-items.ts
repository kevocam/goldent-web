import { CalendarDays, ScanLine, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Rutas que marcan este ítem como activo. */
  match: (path: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Pacientes', icon: Users, match: (p) => p === '/' || p.startsWith('/pacientes') },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays, match: (p) => p.startsWith('/agenda') },
  { href: '/captura', label: 'Captura', icon: ScanLine, match: (p) => p.startsWith('/captura') },
];
