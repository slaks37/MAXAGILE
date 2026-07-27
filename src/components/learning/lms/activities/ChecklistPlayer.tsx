import { Check } from 'lucide-react';
import type { Activity } from '../types';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface ChecklistPlayerProps {
  activity: Activity;
  state: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
}

export function ChecklistPlayer({ activity, state, onChange }: ChecklistPlayerProps) {
  const { t } = useLanguage();
  const items = activity.checklist?.items ?? [];
  const done = items.filter((it) => state[it.id]).length;
  const percent = items.length === 0 ? 0 : Math.round((done / items.length) * 100);

  if (items.length === 0) {
    return <p className="italic text-slate-400">{tr(t, 'lmsChecklistEmpty', 'Belum ada item pada checklist ini.')}</p>;
  }

  function toggle(id: string) {
    onChange({ ...state, [id]: !state[id] });
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-brand-text dark:text-slate-200">
          <span>{tr(t, 'lmsProgressLabel', 'Progres')}</span>
          <span>
            {done}/{items.length} · {percent}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-teal to-emerald-400 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((it) => {
          const checked = !!state[it.id];
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => toggle(it.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition cursor-pointer ${
                  checked
                    ? 'border-brand-teal bg-teal-50 dark:border-brand-teal dark:bg-teal-900/20'
                    : 'border-slate-200 bg-white hover:border-brand-teal dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                    checked ? 'border-brand-teal bg-brand-teal text-white' : 'border-slate-300 dark:border-slate-500'
                  }`}
                >
                  {checked && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span
                  className={`flex-1 text-sm ${
                    checked ? 'text-slate-400 line-through' : 'text-brand-text dark:text-slate-200'
                  }`}
                >
                  {it.text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
