import { LogoMark } from '@/components/ui/logo';

/** Panel izquierdo del login (tablet). La frase "funciona sin conexión" se omite mientras rija D-03. */
export function BrandPanel() {
  return (
    <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-pink-25 px-16 py-14 md:flex">
      <svg width="620" height="620" viewBox="0 0 48 48" aria-hidden className="absolute -right-[180px] -bottom-[200px] opacity-55">
        <path d="M24 1.5 46.5 24 24 46.5 1.5 24Z" fill="none" stroke="#E8A6C4" strokeWidth=".25" />
        <path d="M24 1.5 33 24 24 46.5 15 24Z" fill="none" stroke="#E8A6C4" strokeWidth=".25" />
        <path d="M1.5 24h45" stroke="#E8A6C4" strokeWidth=".25" />
      </svg>
      <span className="relative text-sm font-bold tracking-[.2em] text-ink-muted">HISTORIA CLÍNICA DIGITAL</span>
      <div className="relative flex flex-col items-start gap-7">
        <LogoMark size={132} />
        <p className="m-0 max-w-[460px] text-[42px] leading-[1.1] font-extrabold tracking-[-.025em] text-balance">
          La historia de cada paciente, a un toque.
        </p>
        <p className="m-0 max-w-[420px] text-lg leading-relaxed font-medium text-ink-muted">
          Busca por nombre, DNI o celular y escríbele por WhatsApp sin salir de la ficha.
        </p>
      </div>
      <span className="relative text-sm font-semibold text-ink-muted">Goldent · Consultorio Odontológico</span>
    </section>
  );
}
