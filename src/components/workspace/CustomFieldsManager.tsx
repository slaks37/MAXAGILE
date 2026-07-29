import React, { useState } from 'react';
import { CustomFieldDef } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { tr, parseFieldOptions } from './utils';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Columns3, AlertTriangle } from 'lucide-react';

const FIELD_TYPES: { value: CustomFieldDef['type']; labelKey: string; fallback: string }[] = [
  { value: 'text', labelKey: 'wsFieldTypeText', fallback: 'Teks' },
  { value: 'number', labelKey: 'wsFieldTypeNumber', fallback: 'Angka' },
  { value: 'select', labelKey: 'wsFieldTypeSelect', fallback: 'Pilihan' },
  { value: 'date', labelKey: 'wsFieldTypeDate', fallback: 'Tanggal' },
  { value: 'checkbox', labelKey: 'wsFieldTypeCheckbox', fallback: 'Centang' },
];

interface Props {
  workspaceId: string;
  fields: CustomFieldDef[];
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}

export function CustomFieldsManager({ workspaceId, fields, onClose, onChanged }: Props) {
  const { t } = useLanguage();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CustomFieldDef['type']>('text');
  const [newOptions, setNewOptions] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});

  const sorted = fields.slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  const fail = (msg: string) => setError(msg);

  const createField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    setBusy(true);
    try {
      const optionList = newOptions.split(',').map(o => o.trim()).filter(Boolean);
      const res = await fetch(`/api/workspaces/${workspaceId}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType,
          options: newType === 'select' ? JSON.stringify(optionList) : null,
          order: sorted.length,
        }),
      });
      if (!res.ok) fail(tr(t, 'wsFieldSaveFailed', 'Gagal menyimpan kolom. Coba lagi.'));
      else {
        setNewName('');
        setNewOptions('');
        setNewType('text');
        await onChanged();
      }
    } catch (err) {
      fail(tr(t, 'wsFieldSaveFailed', 'Gagal menyimpan kolom. Coba lagi.'));
    }
    setBusy(false);
  };

  const patchField = async (id: string, body: any) => {
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/fields/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) fail(tr(t, 'wsFieldSaveFailed', 'Gagal menyimpan kolom. Coba lagi.'));
      else await onChanged();
    } catch (err) {
      fail(tr(t, 'wsFieldSaveFailed', 'Gagal menyimpan kolom. Coba lagi.'));
    }
    setBusy(false);
  };

  const deleteField = async (field: CustomFieldDef) => {
    if (!confirm(tr(t, 'wsFieldDeleteConfirm', 'Hapus kolom ini beserta nilainya di semua tugas?'))) return;
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/fields/${field.id}`, { method: 'DELETE' });
      if (!res.ok) fail(tr(t, 'wsFieldDeleteFailed', 'Gagal menghapus kolom.'));
      else await onChanged();
    } catch (err) {
      fail(tr(t, 'wsFieldDeleteFailed', 'Gagal menghapus kolom.'));
    }
    setBusy(false);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[target];
    setError('');
    setBusy(true);
    try {
      await fetch(`/api/fields/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: target }),
      });
      await fetch(`/api/fields/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: index }),
      });
      await onChanged();
    } catch (err) {
      fail(tr(t, 'wsFieldSaveFailed', 'Gagal menyimpan kolom. Coba lagi.'));
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar space-y-5">
        <div className="flex justify-between items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-extrabold text-brand-text dark:text-white flex items-center gap-2">
              <Columns3 size={20} className="text-brand-orange" />
              {tr(t, 'wsCustomFields', 'Kolom Kustom')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {tr(t, 'wsCustomFieldsHint', 'Tambahkan informasi sendiri di setiap tugas ruang kerja ini.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-brand-text dark:hover:text-white cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        {/* Existing fields */}
        <div className="space-y-2.5">
          {sorted.length === 0 ? (
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-6 font-medium bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              {tr(t, 'wsNoCustomFields', 'Belum ada kolom kustom. Buat satu di bawah.')}
            </div>
          ) : (
            sorted.map((field, idx) => {
              const options = parseFieldOptions(field.options);
              return (
                <div
                  key={field.id}
                  className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={field.name}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== field.name) patchField(field.id, { name: v });
                        else e.target.value = field.name;
                      }}
                      className="flex-1 min-w-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold text-brand-text dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => patchField(field.id, { type: e.target.value })}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange shrink-0"
                    >
                      {FIELD_TYPES.map(ft => (
                        <option key={ft.value} value={ft.value}>{tr(t, ft.labelKey, ft.fallback)}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={busy || idx === 0}
                        onClick={() => move(idx, -1)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-text dark:hover:text-white hover:bg-white dark:hover:bg-gray-900 disabled:opacity-25 cursor-pointer transition-colors"
                        title={tr(t, 'wsMoveUp', 'Naikkan')}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={busy || idx === sorted.length - 1}
                        onClick={() => move(idx, 1)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-text dark:hover:text-white hover:bg-white dark:hover:bg-gray-900 disabled:opacity-25 cursor-pointer transition-colors"
                        title={tr(t, 'wsMoveDown', 'Turunkan')}
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteField(field)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-25 cursor-pointer transition-colors"
                        title={tr(t, 'wsDeleteField', 'Hapus kolom')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {field.type === 'select' && (
                    <div className="space-y-1.5 pl-1">
                      <div className="flex flex-wrap gap-1">
                        {options.length === 0 ? (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                            {tr(t, 'wsNoOptions', 'Belum ada pilihan.')}
                          </span>
                        ) : (
                          options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-blue dark:bg-brand-teal/20 text-brand-text dark:text-gray-100 flex items-center gap-1 border border-white dark:border-gray-700"
                            >
                              {opt}
                              <button
                                type="button"
                                onClick={() => patchField(field.id, {
                                  options: JSON.stringify(options.filter((_, i) => i !== oIdx)),
                                })}
                                className="hover:text-red-500 cursor-pointer"
                              >
                                <X size={9} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={optionDrafts[field.id] || ''}
                          onChange={(e) => setOptionDrafts({ ...optionDrafts, [field.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const v = (optionDrafts[field.id] || '').trim();
                              if (v) {
                                patchField(field.id, { options: JSON.stringify([...options, v]) });
                                setOptionDrafts({ ...optionDrafts, [field.id]: '' });
                              }
                            }
                          }}
                          placeholder={tr(t, 'wsNewOption', 'Pilihan baru...')}
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[10px] font-semibold text-brand-text dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const v = (optionDrafts[field.id] || '').trim();
                            if (v) {
                              patchField(field.id, { options: JSON.stringify([...options, v]) });
                              setOptionDrafts({ ...optionDrafts, [field.id]: '' });
                            }
                          }}
                          className="px-2.5 bg-brand-orange text-white text-[10px] font-extrabold rounded-lg cursor-pointer hover:brightness-105"
                        >
                          {tr(t, 'wsAdd', 'Tambah')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* New field form */}
        <form onSubmit={createField} className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <label className="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {tr(t, 'wsNewField', 'Kolom Baru')}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={tr(t, 'wsFieldNamePlaceholder', 'Contoh: Departemen, Estimasi Biaya...')}
              className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-brand-text dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              required
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as CustomFieldDef['type'])}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {FIELD_TYPES.map(ft => (
                <option key={ft.value} value={ft.value}>{tr(t, ft.labelKey, ft.fallback)}</option>
              ))}
            </select>
          </div>

          {newType === 'select' && (
            <input
              type="text"
              value={newOptions}
              onChange={(e) => setNewOptions(e.target.value)}
              placeholder={tr(t, 'wsOptionsPlaceholder', 'Pilihan dipisah koma: Rendah, Sedang, Tinggi')}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-brand-text dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
            >
              {tr(t, 'wsClose', 'Tutup')}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 text-xs font-extrabold text-white bg-brand-text dark:bg-brand-orange border-2 border-b-4 border-black/20 rounded-full shadow-sm transition-all active:translate-y-[2px] active:border-b-2 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> {tr(t, 'wsAddField', 'Tambah Kolom')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomFieldsManager;
