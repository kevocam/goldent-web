'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Textarea } from '@/components/ui/input';
import { ServicePicker } from '@/components/shared/service-picker';
import { ToothPicker } from '@/components/shared/tooth-picker';
import { TREATMENT_STATUS, TREATMENT_STATUS_ORDER } from '@/lib/constants';
import type { DraftTreatment, Service, TreatmentStatus } from '@/types/domain';

type ServiceOption = Pick<Service, 'id' | 'name' | 'category' | 'requires_tooth' | 'sort_order'>;

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-white">{n}</span>
      <span className="text-base font-extrabold">{children}</span>
    </div>
  );
}

/** 4 pasos: servicio → pieza(s) FDI → estado → notas → Agregar. */
export function TreatmentBuilder({ services, onAdd }: { services: ServiceOption[]; onAdd: (t: DraftTreatment) => void }) {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [teeth, setTeeth] = useState<string[]>([]);
  const [wholeMouth, setWholeMouth] = useState(false);
  const [status, setStatus] = useState<TreatmentStatus>('done');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string>();

  const service = services.find((s) => s.id === serviceId);

  const add = () => {
    if (!service) return;
    if (service.requires_tooth && !wholeMouth && teeth.length === 0) {
      setError(`Elige la pieza para "${service.name}" o marca boca completa`);
      return;
    }
    onAdd({
      key: crypto.randomUUID(),
      serviceId: service.id,
      serviceName: service.name,
      teeth: [...teeth].sort(),
      wholeMouth: wholeMouth || teeth.length === 0,
      status,
      notes: notes.trim() || undefined,
    });
    setServiceId(null);
    setTeeth([]);
    setWholeMouth(false);
    setStatus('done');
    setNotes('');
    setError(undefined);
  };

  return (
    <Card as="section" className="flex flex-col gap-[22px] p-5 md:px-6 md:py-[22px]">
      <h2 className="m-0 text-lg font-extrabold">Agregar tratamiento</h2>

      <div className="flex flex-col gap-3">
        <Step n={1}>Servicio</Step>
        <ServicePicker
          services={services}
          value={serviceId}
          onChange={(id) => {
            setServiceId(id);
            setError(undefined);
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Step n={2}>
          Pieza dental <span className="font-semibold text-ink-muted">· FDI · puedes elegir varias</span>
        </Step>
        <ToothPicker
          value={teeth}
          onChange={(t) => {
            setTeeth(t);
            setError(undefined);
          }}
          wholeMouth={wholeMouth}
          onWholeMouthChange={(w) => {
            setWholeMouth(w);
            setError(undefined);
          }}
          error={error}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-3">
          <Step n={3}>Estado</Step>
          <SegmentedControl
            label="Estado del tratamiento"
            size="lg"
            stretch
            value={status}
            onChange={setStatus}
            options={TREATMENT_STATUS_ORDER.map((s) => ({ value: s, label: TREATMENT_STATUS[s].label }))}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Step n={4}>
            <label htmlFor="treatment-notes">Notas</label>
          </Step>
          <Textarea id="treatment-notes" rows={3} placeholder="Hallazgos, materiales, indicaciones…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <Button onClick={add} disabled={!service} className="min-h-[60px] self-stretch text-[17px] md:min-w-[340px] md:self-end">
        <Plus className="size-5" aria-hidden />
        {service ? `Agregar “${service.name}”` : 'Elige un servicio'}
      </Button>
    </Card>
  );
}
