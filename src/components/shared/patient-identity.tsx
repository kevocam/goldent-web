import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import { formatPhone, initials, recordDigits } from '@/lib/format';

export interface IdentityData {
  first_names: string;
  last_names: string;
  record_number: string;
  dni: string | null;
  phone: string | null;
  age: number | null;
}

export function PatientAvatar({
  patient,
  size,
}: {
  patient: Pick<IdentityData, 'first_names' | 'last_names'>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}) {
  return <Avatar initials={initials(patient)} size={size} />;
}

/** "HC 00248 · 47 años · DNI 41827365 · 951 284 736" con las partes que existan. */
export function identityParts(p: IdentityData, include: { age?: boolean; dni?: boolean; phone?: boolean } = {}) {
  const { age = true, dni = true, phone = true } = include;
  const parts: { key: string; label: string; value: string }[] = [{ key: 'hc', label: 'HC', value: recordDigits(p.record_number) }];
  if (age && p.age !== null) parts.push({ key: 'age', label: '', value: `${p.age} años` });
  if (dni && p.dni) parts.push({ key: 'dni', label: 'DNI', value: p.dni });
  if (phone && p.phone) parts.push({ key: 'phone', label: 'Cel.', value: formatPhone(p.phone) });
  return parts;
}

export interface PatientIdentityProps {
  patient: IdentityData;
  /** "row": línea de datos en gris. "header": datos con valores resaltados (encabezado de ficha). */
  layout?: 'row' | 'header';
  include?: { age?: boolean; dni?: boolean; phone?: boolean };
  className?: string;
}

/** Línea de identificación del paciente. */
export function PatientIdentity({ patient, layout = 'row', include, className }: PatientIdentityProps) {
  const parts = identityParts(patient, include);

  if (layout === 'header') {
    return (
      <div className={cn('tabular flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold text-ink-muted md:text-[15px]', className)}>
        {parts.map((p) => (
          <span key={p.key}>
            {p.label ? `${p.label} ` : null}
            {p.label ? <strong className="font-bold text-ink">{p.value}</strong> : p.value}
          </span>
        ))}
      </div>
    );
  }

  return (
    <span className={cn('tabular text-sm font-semibold text-ink-muted', className)}>
      {parts.map((p) => (p.label && p.key !== 'phone' ? `${p.label} ${p.value}` : p.value)).join(' · ')}
    </span>
  );
}
