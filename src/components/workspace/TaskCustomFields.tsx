import React from 'react';
import { CustomFieldDef } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { tr, parseFieldOptions, formatFieldValue } from './utils';
import { Columns3 } from 'lucide-react';

interface Props {
  fields: CustomFieldDef[];
  values: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

/** One input per workspace-defined field, rendered inside the task detail modal. */
export function TaskCustomFields({ fields, values, onChange }: Props) {
  const { t } = useLanguage();
  const sorted = fields.slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  const set = (id: string, value: any) => onChange({ ...values, [id]: value });

  const inputClass =
    'w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-brand-text dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-orange';

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-2.5 pt-1">
      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
        <Columns3 size={12} className="text-brand-orange" />
        {tr(t, 'wsCustomFields', 'Kolom Kustom')}
      </label>

      {sorted.map(field => {
        const raw = values[field.id];
        return (
          <div key={field.id} className="space-y-1">
            {field.type !== 'checkbox' && (
              <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 truncate">{field.name}</span>
            )}

            {field.type === 'text' && (
              <input
                type="text"
                value={raw === undefined || raw === null ? '' : String(raw)}
                onChange={(e) => set(field.id, e.target.value)}
                className={inputClass}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={raw === undefined || raw === null ? '' : String(raw)}
                onChange={(e) => set(field.id, e.target.value === '' ? '' : Number(e.target.value))}
                className={inputClass}
              />
            )}

            {field.type === 'date' && (
              <input
                type="date"
                value={raw ? String(raw).substring(0, 10) : ''}
                onChange={(e) => set(field.id, e.target.value)}
                className={inputClass}
              />
            )}

            {field.type === 'select' && (
              <select
                value={raw === undefined || raw === null ? '' : String(raw)}
                onChange={(e) => set(field.id, e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">{tr(t, 'wsFieldEmpty', '— Kosong —')}</option>
                {parseFieldOptions(field.options).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && (
              <label className="flex items-center gap-2 text-xs font-bold text-brand-text dark:text-gray-100 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                <input
                  type="checkbox"
                  checked={!!raw}
                  onChange={(e) => set(field.id, e.target.checked)}
                  className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange border-gray-300 cursor-pointer"
                />
                <span className="truncate">{field.name}</span>
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Compact chips for the List view — shows the first few filled-in fields. */
export function CustomFieldChips({
  fields,
  values,
  max = 3,
}: {
  fields: CustomFieldDef[];
  values: Record<string, any>;
  max?: number;
}) {
  const sorted = fields.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const chips: { name: string; text: string }[] = [];

  for (const field of sorted) {
    if (chips.length >= max) break;
    const text = formatFieldValue(field, values[field.id]);
    if (!text) continue;
    chips.push({ name: field.name, text });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {chips.map((c, i) => (
        <span
          key={i}
          className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-blue dark:bg-brand-teal/20 text-brand-text dark:text-gray-200 border border-white dark:border-gray-700 truncate max-w-[150px]"
          title={`${c.name}: ${c.text}`}
        >
          <span className="opacity-60">{c.name}:</span> {c.text}
        </span>
      ))}
    </div>
  );
}

export default TaskCustomFields;
