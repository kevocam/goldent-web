'use client';

import { Chip } from '@/components/ui/chip';
import type { Service } from '@/types/domain';

export interface ServicePickerProps {
  services: Pick<Service, 'id' | 'name' | 'category' | 'sort_order'>[];
  value: string | null;
  onChange: (serviceId: string) => void;
}

/** Chips agrupados por categoría, en el orden de services.sort_order. */
export function ServicePicker({ services, value, onChange }: ServicePickerProps) {
  const groups = new Map<string, ServicePickerProps['services']>();
  [...services]
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((s) => groups.set(s.category, [...(groups.get(s.category) ?? []), s]));

  return (
    <div role="radiogroup" aria-label="Servicio" className="flex flex-col gap-3 md:gap-2.5">
      {[...groups.entries()].map(([category, items]) => (
        <div key={category} className="flex flex-col gap-2 md:grid md:grid-cols-[150px_minmax(0,1fr)] md:items-center md:gap-3">
          <span className="text-sm font-bold text-ink-muted">{category}</span>
          <div className="flex flex-wrap gap-2">
            {items.map((s) => (
              <Chip key={s.id} role="radio" aria-checked={s.id === value} selected={s.id === value} onClick={() => onChange(s.id)}>
                {s.name}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
