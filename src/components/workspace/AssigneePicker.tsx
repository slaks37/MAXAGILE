import React, { useState } from 'react';
import { AppUser } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { tr, initialsOf, readableTextOn } from './utils';
import { Check, ChevronDown, UserRound } from 'lucide-react';

/** Small circular avatar used on cards, list rows and inside the picker. */
export function Avatar({
  name,
  color,
  size = 22,
  title,
}: {
  name?: string | null;
  color?: string | null;
  size?: number;
  title?: string;
}) {
  const bg = color || '#F3A733';
  return (
    <span
      title={title || name || ''}
      className="inline-flex items-center justify-center rounded-full font-extrabold shrink-0 shadow-sm ring-1 ring-white/70 dark:ring-black/30 select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: readableTextOn(bg),
        fontSize: Math.max(8, Math.round(size * 0.42)),
        lineHeight: 1,
      }}
    >
      {initialsOf(name || '')}
    </span>
  );
}

interface Props {
  users: AppUser[];
  value: string | null;
  onChange: (userId: string | null) => void;
  compact?: boolean;
}

export function AssigneePicker({ users, value, onChange, compact }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selected = users.find(u => u.id === value) || null;

  const pick = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-brand-text dark:text-gray-100 hover:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer transition-all ${compact ? 'py-1.5' : ''}`}
      >
        {selected ? (
          <>
            <Avatar name={selected.name} color={selected.color} size={20} />
            <span className="truncate flex-1 text-left">{selected.name}</span>
          </>
        ) : (
          <>
            <span className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0">
              <UserRound size={10} className="text-gray-400" />
            </span>
            <span className="truncate flex-1 text-left text-gray-400 dark:text-gray-500">
              {tr(t, 'wsNoAssignee', 'Tanpa penanggung jawab')}
            </span>
          </>
        )}
        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl p-1.5 animate-in fade-in">
            <button
              type="button"
              onClick={() => pick(null)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <span className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 shrink-0" />
              <span className="flex-1 text-left truncate">{tr(t, 'wsNoAssignee', 'Tanpa penanggung jawab')}</span>
              {!value && <Check size={14} className="text-brand-orange shrink-0" />}
            </button>

            {users.length === 0 && (
              <div className="px-2.5 py-3 text-[11px] text-gray-400 dark:text-gray-500 font-semibold text-center">
                {tr(t, 'wsNoUsers', 'Belum ada anggota tim.')}
              </div>
            )}

            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => pick(u.id)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-brand-text dark:text-gray-100 hover:bg-brand-orange/10 cursor-pointer transition-colors"
              >
                <Avatar name={u.name} color={u.color} size={20} />
                <span className="flex-1 text-left truncate">{u.name}</span>
                {value === u.id && <Check size={14} className="text-brand-orange shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AssigneePicker;
