'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { AlertPill } from '@/components/shared/medical-alerts';
import { DuplicateDniNotice, type DuplicateMatch } from '@/components/shared/duplicate-dni-notice';
import { FormActions } from '@/components/shared/form-actions';
import { PageHeader } from '@/components/shared/page-header';
import { createPatient, updatePatient } from '@/lib/actions/patients';
import { MARITAL_STATUS } from '@/lib/constants';
import { ageFrom, formatPhone, todayISO } from '@/lib/format';
import { patientSchema, type PatientFormValues, type PatientInput } from '@/lib/schemas/patient';
import type { PatientCondition } from '@/types/domain';
import { ConditionToggle } from './condition-toggle';

export interface PatientFormProps {
  mode: 'create' | 'edit';
  patientId?: string;
  /** "HC-00252 · se asigna automáticamente" o el número actual en edición. */
  recordLabel: string;
  conditions: PatientCondition[];
  defaultValues?: Partial<PatientFormValues>;
  /** A dónde vuelve "Cancelar". */
  cancelHref: string;
}

const FORM_ID = 'patient-form';

/** F04 · Datos personales + antecedentes. Mismo componente para crear y editar. */
export function PatientForm({ mode, patientId, recordLabel, conditions, defaultValues, cancelHref }: PatientFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [duplicate, setDuplicate] = useState<DuplicateMatch | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PatientFormValues, unknown, PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_names: '',
      last_names: '',
      dni: '',
      birth_date: '',
      phone: '',
      email: '',
      address: '',
      occupation: '',
      marital_status: null,
      ...defaultValues,
      conditions: conditions.map((c) => ({ conditionId: c.conditionId, active: c.active, detail: c.detail ?? '' })),
    },
  });

  const onDuplicateChange = useCallback((m: DuplicateMatch | null) => setDuplicate(m), []);

  const values = watch();
  const age = ageFrom(values.birth_date);
  const activeCount = (values.conditions ?? []).filter((c) => c.active).length;

  // El cliente valida con zod; al servidor va el valor crudo y lo vuelve a validar con el mismo esquema.
  const onSubmit = handleSubmit(async () => {
    if (duplicate) return;
    setServerError(null);
    const raw = getValues();
    const res = mode === 'create' ? await createPatient(raw) : await updatePatient(patientId!, raw);
    if (!res.ok) {
      setServerError(res.error);
      Object.entries(res.fieldErrors ?? {}).forEach(([k, msg]) => setError(k as keyof PatientFormValues, { message: msg }));
      return;
    }
    if (mode === 'create' && res.data) {
      toast({ title: 'Paciente guardado', description: res.data.record_number });
      router.push(`/pacientes/${res.data.id}`);
    } else {
      toast({ title: 'Cambios guardados' });
      router.push(cancelHref);
    }
    router.refresh();
  });

  const cancel = () => (isDirty ? setConfirmCancel(true) : router.push(cancelHref));

  return (
    <>
      <PageHeader
        title={mode === 'create' ? 'Nuevo paciente' : 'Editar paciente'}
        subtitle={recordLabel}
        actions={<FormActions form={FORM_ID} onCancel={cancel} submitLabel="Guardar paciente" submitting={isSubmitting} disabled={!!duplicate} className="hidden md:flex" />}
      />

      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-5 px-4 py-5 md:px-8 md:pt-6 md:pb-8">
        {serverError ? (
          <p role="alert" className="m-0 rounded-[14px] bg-alert-50 px-4 py-3 text-[15px] font-bold text-alert">
            {serverError}
          </p>
        ) : null}

        <Card as="section" className="flex flex-col gap-5 p-5 md:px-[26px] md:py-6">
          <h2 className="m-0 text-xl font-extrabold">Datos personales</h2>
          <div className="grid gap-x-4 gap-y-[18px] sm:grid-cols-2">
            <Field label="Nombres" required htmlFor="first_names" error={errors.first_names?.message}>
              <Input id="first_names" autoCapitalize="words" autoComplete="off" invalid={!!errors.first_names} {...register('first_names')} />
            </Field>
            <Field label="Apellidos" required htmlFor="last_names" error={errors.last_names?.message}>
              <Input id="last_names" autoCapitalize="words" autoComplete="off" invalid={!!errors.last_names} {...register('last_names')} />
            </Field>
            <Field
              label="DNI"
              required
              htmlFor="dni"
              error={errors.dni?.message}
              hint={<DuplicateDniNotice dni={values.dni ?? ''} excludeId={patientId} onDuplicateChange={onDuplicateChange} />}
            >
              <Input id="dni" inputMode="numeric" maxLength={8} className="tabular" invalid={!!errors.dni || !!duplicate} {...register('dni')} />
            </Field>
            <Field label="Fecha de nacimiento" htmlFor="birth_date" error={errors.birth_date?.message}>
              <Input
                id="birth_date"
                type="date"
                max={todayISO()}
                className="tabular"
                invalid={!!errors.birth_date}
                suffix={
                  age !== null ? (
                    <span className="flex min-h-9 items-center rounded-[10px] bg-surface-2 px-3 text-sm font-bold text-ink-muted">{age} años</span>
                  ) : null
                }
                {...register('birth_date')}
              />
            </Field>
            <Field label="Celular" required htmlFor="phone" error={errors.phone?.message}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <Input
                    id="phone"
                    prefix="+51"
                    inputMode="tel"
                    autoComplete="off"
                    className="tabular"
                    invalid={!!errors.phone}
                    value={formatPhone(field.value)}
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </Field>
            <Field label="Correo · opcional" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" placeholder="nombre@gmail.com" invalid={!!errors.email} {...register('email')} />
            </Field>
            <Field label="Domicilio" htmlFor="address" className="sm:col-span-2">
              <Input id="address" {...register('address')} />
            </Field>
            <Field label="Ocupación" htmlFor="occupation" className="sm:col-span-2">
              <Input id="occupation" {...register('occupation')} />
            </Field>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="field-label">Estado civil</span>
            <Controller
              control={control}
              name="marital_status"
              render={({ field }) => (
                <ChipGroup label="Estado civil" options={MARITAL_STATUS} value={field.value} onChange={field.onChange} size="lg" allowEmpty />
              )}
            />
          </div>
        </Card>

        <Card as="section" id="antecedentes" className="flex scroll-mt-4 flex-col gap-1.5 px-5 pt-5 pb-3 md:px-[26px] md:pt-6">
          <div className="flex items-end gap-3 pb-3">
            <div className="flex flex-1 flex-col gap-1">
              <h2 className="m-0 text-xl font-extrabold">Antecedentes médicos</h2>
              <p className="m-0 text-[15px] font-medium text-ink-muted">Activa solo lo que aplique. Lo marcado con “Sí” aparece como alerta en la ficha.</p>
            </div>
            {activeCount > 0 ? <AlertPill label={activeCount === 1 ? '1 alerta' : `${activeCount} alertas`} /> : null}
          </div>
          {conditions.map((c, i) => (
            <Controller
              key={c.conditionId}
              control={control}
              name={`conditions.${i}`}
              render={({ field }) => (
                <ConditionToggle
                  code={c.code}
                  label={c.label}
                  active={field.value.active}
                  detail={field.value.detail ?? ''}
                  onActiveChange={(active) => field.onChange({ ...field.value, active })}
                  onDetailChange={(detail) => field.onChange({ ...field.value, detail })}
                />
              )}
            />
          ))}
        </Card>

        <FormActions onCancel={cancel} submitLabel="Guardar paciente" submitting={isSubmitting} disabled={!!duplicate} size="lg" className="md:justify-end" />
      </form>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => router.push(cancelHref)}
        title="¿Descartar los cambios?"
        description="Lo que escribiste no se guardará."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        tone="danger"
      />
    </>
  );
}
