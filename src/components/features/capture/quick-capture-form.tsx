'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, RotateCw } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { DuplicateDniNotice, type DuplicateMatch } from '@/components/shared/duplicate-dni-notice';
import { PhotoCapture, type CapturedPhoto } from '@/components/shared/photo-capture';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import { quickCapture, undoQuickCapture } from '@/lib/actions/patients';
import { formatPhone, pluralize } from '@/lib/format';
import { quickCaptureSchema, type QuickCaptureInput, type QuickCaptureValues } from '@/lib/schemas/patient';
import { APP_HOME } from '@/lib/constants';

interface Saved {
  id: string;
  name: string;
  record_number: string;
  pages: number;
  failed: File[];
  at: number;
}

const EMPTY: QuickCaptureValues = { first_names: '', last_names: '', dni: '', phone: '', legacy_record_number: '' };
const UNDO_MS = 30_000;

function nextRecord(record: string): string {
  const n = Number(record.replace(/\D/g, '')) + 1;
  return `HC-${String(n).padStart(5, '0')}`;
}

/** F05 · 4 datos + fotos del formato, "Guardar y siguiente" sin salir de la pantalla. */
export function QuickCaptureForm({ nextRecordNumber }: { nextRecordNumber: string }) {
  const router = useRouter();
  const toast = useToast();
  const online = useOnlineStatus();
  const { upload, uploading, progress } = usePhotoUpload();

  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [count, setCount] = useState(0);
  const [record, setRecord] = useState(nextRecordNumber);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateMatch | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [undoing, setUndoing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuickCaptureValues, unknown, QuickCaptureInput>({ resolver: zodResolver(quickCaptureSchema), defaultValues: EMPTY });

  const onDuplicateChange = useCallback((m: DuplicateMatch | null) => setDuplicate(m), []);
  const dni = watch('dni') ?? '';

  // "Deshacer" disponible 30 s.
  useEffect(() => {
    if (!saved) return;
    const left = UNDO_MS - (Date.now() - saved.at);
    const id = setTimeout(() => setSaved((s) => (s && s.failed.length === 0 ? null : s)), Math.max(left, 0));
    return () => clearTimeout(id);
  }, [saved]);

  const save = (after: 'next' | 'exit') =>
    handleSubmit(async (data) => {
      if (duplicate) return;
      setServerError(null);
      const res = await quickCapture(getValues());
      if (!res.ok) {
        setServerError(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => setError(k as keyof QuickCaptureValues, { message: m }));
        return;
      }

      const files = photos.map((p) => p.file);
      const result = files.length ? await upload(files, { patientId: res.data.id, kind: 'paper_record', numberPages: true }) : { uploaded: 0, failed: [] };

      const entry: Saved = {
        id: res.data.id,
        name: `${data.first_names} ${data.last_names}`,
        record_number: res.data.record_number,
        pages: result.uploaded,
        failed: result.failed,
        at: Date.now(),
      };

      if (after === 'exit') {
        toast({ title: 'Historia guardada', description: `${entry.name} · ${entry.record_number}` });
        router.push(APP_HOME);
        router.refresh();
        return;
      }

      setCount((c) => c + 1);
      setRecord(nextRecord(res.data.record_number));
      setSaved(entry);
      setPhotos([]);
      setDuplicate(null);
      reset(EMPTY);
      setFocus('first_names');
    })();

  const retryUpload = async () => {
    if (!saved) return;
    const result = await upload(saved.failed, { patientId: saved.id, kind: 'paper_record', numberPages: true });
    setSaved({ ...saved, pages: saved.pages + result.uploaded, failed: result.failed, at: Date.now() });
  };

  const undo = async () => {
    if (!saved) return;
    setUndoing(true);
    const res = await undoQuickCapture(saved.id);
    setUndoing(false);
    if (!res.ok) {
      toast({ title: 'No se pudo deshacer', description: res.error, tone: 'error' });
      return;
    }
    toast({ title: 'Captura deshecha', description: saved.name });
    setCount((c) => Math.max(0, c - 1));
    setSaved(null);
  };

  const busy = isSubmitting || uploading;

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-6 md:gap-[18px] md:px-8 md:pt-[26px]">
      <div className="flex items-center gap-3 md:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="m-0 text-[26px] font-extrabold tracking-[-.02em] md:text-[28px]">Captura rápida</h1>
          <p className="m-0 hidden text-[15px] font-medium text-ink-muted md:block">
            Historias antiguas: 4 datos y una foto del formato. El resto se completa después.
          </p>
        </div>
        <span className="tabular rounded-full bg-gold-50 px-3 py-1.5 text-sm font-extrabold text-gold-900 md:hidden" aria-live="polite">
          {count} en esta sesión
        </span>
        <div className="hidden items-center gap-3.5 rounded-[18px] border border-gold-100 bg-gold-50 py-2.5 pr-5 pl-3 md:flex">
          <span className="tabular flex h-14 min-w-14 items-center justify-center rounded-[14px] bg-gold-700 px-2.5 text-[28px] font-extrabold text-white">
            {count}
          </span>
          <span className="flex flex-col gap-0.5 text-gold-900">
            <span className="text-[15px] font-extrabold">{count === 1 ? 'historia digitalizada' : 'historias digitalizadas'}</span>
            <span className="text-[13px] font-semibold">en esta sesión</span>
          </span>
        </div>
        <ButtonLink href={APP_HOME} variant="secondary" className="hidden md:inline-flex">
          Terminar
        </ButtonLink>
      </div>

      {saved ? (
        <div
          role="status"
          className="flex min-h-[52px] flex-wrap items-center gap-3 rounded-2xl bg-ok-50 py-1.5 pr-2 pl-4 text-ok-700"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ok text-white">
            <Check className="size-4" aria-hidden />
          </span>
          <span className="flex-1 text-[15px] font-bold">
            Guardada:{' '}
            <Link href={`/pacientes/${saved.id}`} className="text-ok-700">
              {saved.name}
            </Link>{' '}
            · {saved.record_number} · {pluralize(saved.pages, 'página', 'páginas')}
            {saved.failed.length ? <span className="text-alert"> · {pluralize(saved.failed.length, 'página no se subió', 'páginas no se subieron')}</span> : null}
          </span>
          {saved.failed.length ? (
            <Button variant="ghost" size="sm" onClick={retryUpload} loading={uploading} className="text-ok-700">
              <RotateCw className="size-4" aria-hidden />
              Reintentar
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={undo} loading={undoing} className="text-ok-700 underline">
            Deshacer
          </Button>
        </div>
      ) : null}

      {serverError ? (
        <p role="alert" className="m-0 rounded-[14px] bg-alert-50 px-4 py-3 text-[15px] font-bold text-alert">
          {serverError}
        </p>
      ) : null}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void save('next');
        }}
        className="flex flex-col gap-4 md:gap-[18px]"
      >
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <Card as="section" className="flex flex-col gap-[18px] p-5 md:p-6">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="m-0 text-xl font-extrabold">Historia n.º {count + 1}</h2>
              <span className="tabular text-sm font-semibold text-ink-muted">{record} al guardar</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombres" htmlFor="qc-first" error={errors.first_names?.message}>
                <Input id="qc-first" inputSize="lg" autoCapitalize="words" autoComplete="off" autoFocus invalid={!!errors.first_names} {...register('first_names')} />
              </Field>
              <Field label="Apellidos" htmlFor="qc-last" error={errors.last_names?.message}>
                <Input id="qc-last" inputSize="lg" autoCapitalize="words" autoComplete="off" invalid={!!errors.last_names} {...register('last_names')} />
              </Field>
              <Field
                label="DNI"
                htmlFor="qc-dni"
                error={errors.dni?.message}
                hint={<DuplicateDniNotice dni={dni} onDuplicateChange={onDuplicateChange} />}
              >
                <Input id="qc-dni" inputSize="lg" inputMode="numeric" maxLength={8} className="tabular" invalid={!!errors.dni || !!duplicate} {...register('dni')} />
              </Field>
              <Field label="Celular" htmlFor="qc-phone" error={errors.phone?.message}>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <Input
                      id="qc-phone"
                      inputSize="lg"
                      prefix="+51"
                      inputMode="tel"
                      autoComplete="off"
                      invalid={!!errors.phone}
                      value={formatPhone(field.value)}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="tabular"
                    />
                  )}
                />
              </Field>
            </div>
            <Field label="N.º de historia en papel · opcional" htmlFor="qc-legacy">
              <Input id="qc-legacy" inputSize="lg" inputMode="numeric" placeholder="Ej. 0187" autoComplete="off" {...register('legacy_record_number')} />
            </Field>
          </Card>

          <Card as="section" className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="m-0 text-xl font-extrabold">Formato en papel</h2>
              <span className="text-sm font-semibold text-ink-muted">{photos.length ? pluralize(photos.length, 'página', 'páginas') : 'Opcional'}</span>
            </div>
            <PhotoCapture
              photos={photos}
              disabled={busy}
              hint="Una foto por página · puedes agregar varias"
              onAdd={(files) => setPhotos((p) => [...p, ...files.map((file) => ({ key: crypto.randomUUID(), file }))])}
              onRemove={(key) => setPhotos((p) => p.filter((x) => x.key !== key))}
            />
          </Card>
        </div>

        <div className="flex gap-3.5">
          <Button variant="secondary" size="lg" onClick={() => void save('exit')} disabled={busy || !online || !!duplicate}>
            Guardar y salir
          </Button>
          <Button type="submit" size="lg" className="flex-1" loading={busy} disabled={!online || !!duplicate}>
            {busy && progress ? `Subiendo página ${progress.done + 1} de ${progress.total}…` : 'Guardar y siguiente'}
            {busy ? null : <ArrowRight className="size-[22px]" aria-hidden />}
          </Button>
        </div>
      </form>
    </div>
  );
}
