'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordInput({ id, name, autoComplete }: { id: string; name: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="flex h-[60px] items-center rounded-[14px] border-[1.5px] border-line bg-surface pl-[18px] focus-within:border-gold-700 focus-within:ring-4 focus-within:ring-gold-500/20">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        required
        autoComplete={autoComplete}
        placeholder="••••••••"
        className="h-full min-w-0 flex-1 border-0 bg-transparent text-lg font-semibold text-ink outline-none"
      />
      <button
        type="button"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setVisible((v) => !v)}
        className="flex size-14 cursor-pointer items-center justify-center border-0 bg-transparent text-ink-muted"
      >
        {visible ? <EyeOff className="size-[22px]" aria-hidden /> : <Eye className="size-[22px]" aria-hidden />}
      </button>
    </span>
  );
}
