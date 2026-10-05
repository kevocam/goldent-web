import type { ReactNode } from 'react';
import { Crown, ImageIcon, Scissors, Sparkles } from 'lucide-react';

type IconProps = { className?: string };

/** Muela simple (lucide no trae una). */
function ToothIcon({ className, root }: { className?: string; root?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 8 .4 2.7 1 5.5 2.5 5.5 1.7 0 1.6-5 3-5h1c1.4 0 1.3 5 3 5 1.5 0 2.1-2.8 2.5-5.5.5-3.5 2-5 2-8C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z" />
      {root ? <path d="M12 8v5" /> : null}
    </svg>
  );
}

function BracesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M3 12h18M5 9h4v6H5ZM10 9h4v6h-4ZM15 9h4v6h-4Z" />
    </svg>
  );
}

type Item = { title: string; text: string; icon: (p: IconProps) => ReactNode };

const RootIcon = (p: IconProps) => <ToothIcon {...p} root />;

/** Mismos servicios que el catálogo del sistema (tabla services). */
const SERVICES: Item[] = [
  { title: 'Restauraciones', text: 'Resinas simples, compuestas y complejas para caries y piezas fracturadas.', icon: ToothIcon },
  { title: 'Endodoncia', text: 'Tratamiento de conductos uni y multirradicular, y biopulpotomía.', icon: RootIcon },
  { title: 'Prótesis', text: 'Pernos, prótesis fija, parcial removible y total para recuperar tus piezas.', icon: Crown },
  { title: 'Prevención y estética', text: 'Profilaxis, destartraje y blanqueamiento para mantener tu sonrisa sana.', icon: Sparkles },
  { title: 'Cirugía e implantes', text: 'Cirugía bucal e implantes dentales con evaluación previa.', icon: Scissors },
  { title: 'Ortodoncia', text: 'Inicio del tratamiento y controles mensuales.', icon: BracesIcon },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="scroll-mt-4 bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-14 md:px-10 md:py-24">
        <div className="flex max-w-[640px] flex-col gap-3">
          <span className="text-[13px] font-extrabold tracking-[.16em] text-gold-700 uppercase">Servicios</span>
          <h2 className="m-0 text-[clamp(30px,3.6vw,42px)] leading-[1.1] font-extrabold tracking-[-.02em]">Todo lo que necesitas, en un solo consultorio.</h2>
          <p className="m-0 text-[17px] leading-relaxed font-medium text-ink-muted">Escríbenos y te decimos qué tratamiento corresponde y cuánto tiempo toma.</p>
        </div>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
          {SERVICES.map(({ title, text, icon: Icon }) => (
            <article key={title} className="flex flex-col gap-3.5 rounded-[22px] border border-line-card bg-surface p-[26px]">
              <span className="flex size-[52px] items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
                <Icon className="size-[26px]" />
              </span>
              <h3 className="m-0 text-[21px] font-extrabold">{title}</h3>
              <p className="m-0 text-base leading-normal font-medium text-ink-muted">{text}</p>
            </article>
          ))}
        </div>
        <p className="m-0 flex items-center gap-2.5 text-[15px] font-bold text-ink-muted">
          <ImageIcon className="size-5 text-gold-700" aria-hidden />
          Rayos X en el mismo consultorio.
        </p>
      </div>
    </section>
  );
}
