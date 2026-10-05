import { clinicPhoneLabel } from '@/lib/clinic';

/** "Así es atenderte en GOLDENT": solo lo que el consultorio hace de verdad. */
export function CareSection() {
  const steps = [
    { title: 'Reservas por WhatsApp', text: `Escríbenos al ${clinicPhoneLabel()}, te proponemos un horario y listo. Sin llamadas ni formularios.` },
    { title: 'Siempre la misma doctora', text: 'No cambias de especialista en cada visita: quien te atiende conoce tu caso de principio a fin.' },
    { title: 'Tu historia, siempre a la mano', text: 'Tratamientos, radiografías y antecedentes guardados en un solo lugar, de visita en visita.' },
  ];

  return (
    <section className="bg-bg">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-9 px-4 py-14 md:px-10 md:py-[88px]">
        <h2 className="m-0 max-w-[640px] text-[clamp(28px,3.2vw,38px)] leading-[1.15] font-extrabold tracking-[-.02em]">Así es atenderte en GOLDENT</h2>
        <ol className="m-0 grid list-none gap-5 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3 rounded-[22px] border border-line-card bg-surface p-[26px]">
              <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-ink text-[17px] font-extrabold text-white">
                {i + 1}
              </span>
              <h3 className="m-0 text-xl font-extrabold">{s.title}</h3>
              <p className="m-0 text-base leading-normal font-medium text-ink-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
