import { BrandPanel } from '@/components/features/auth/brand-panel';
import { Logo } from '@/components/ui/logo';

/** Login y recuperación: panel de marca (tablet) + formulario. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-surface">
      <BrandPanel />
      <section className="flex w-full flex-col justify-center gap-9 px-6 py-10 md:w-[540px] md:shrink-0 md:px-[72px]">
        <Logo />
        {children}
      </section>
    </div>
  );
}
