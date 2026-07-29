import React, { useMemo, useState } from 'react';
import { Status, WorkItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { tr, parseStoryPoints, isItemDone } from './utils';
import { Lock, Plus, Search, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  taskId: string;
  blockedBy: string[];
  allItems: WorkItem[];
  statuses: Status[];
  onChange: (nextBlockedBy: string[]) => void;
}

export function DependencyEditor({ taskId, blockedBy, allItems, statuses, onChange }: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const ids = Array.isArray(blockedBy) ? blockedBy : [];

  const blockers = useMemo(
    () => ids.map(id => allItems.find(i => i.id === id)).filter(Boolean) as WorkItem[],
    [ids, allItems],
  );

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems
      .filter(i => i.id !== taskId && ids.indexOf(i.id) === -1)
      .filter(i => !q || parseStoryPoints(i.title).cleanTitle.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allItems, taskId, ids, query]);

  const addDependency = async (blockingId: string) => {
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/work-items/${taskId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockingId }),
      });
      if (res.ok) {
        onChange([...ids, blockingId]);
        setQuery('');
        setAdding(false);
      } else if (res.status === 400) {
        setError(tr(t, 'wsDepCycle', 'Tidak bisa: akan membuat ketergantungan melingkar'));
      } else if (res.status === 409) {
        setError(tr(t, 'wsDepExists', 'Ketergantungan ini sudah ada.'));
      } else {
        setError(tr(t, 'wsDepFailed', 'Gagal menambah ketergantungan. Coba lagi.'));
      }
    } catch (e) {
      setError(tr(t, 'wsDepFailed', 'Gagal menambah ketergantungan. Coba lagi.'));
    }
    setBusy(false);
  };

  const removeDependency = async (blockingId: string) => {
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/work-items/${taskId}/dependencies/${blockingId}`, { method: 'DELETE' });
      if (res.ok) {
        onChange(ids.filter(id => id !== blockingId));
      } else {
        setError(tr(t, 'wsDepRemoveFailed', 'Gagal menghapus ketergantungan.'));
      }
    } catch (e) {
      setError(tr(t, 'wsDepRemoveFailed', 'Gagal menghapus ketergantungan.'));
    }
    setBusy(false);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lock size={12} className="text-brand-orange" />
          {tr(t, 'wsWaitingOn', 'Menunggu tugas')}
        </label>
        {!adding && (
          <button
            type="button"
            onClick={() => { setAdding(true); setError(''); }}
            className="text-[10px] font-extrabold text-brand-orange hover:text-brand-text dark:hover:text-white bg-brand-orange/10 px-2.5 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1"
          >
            <Plus size={11} /> {tr(t, 'wsAddBlocker', 'Tambah')}
          </button>
        )}
      </div>

      <div className="bg-gray-50/70 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2">
        {blockers.length === 0 ? (
          <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center py-2 font-medium">
            {tr(t, 'wsNoBlockers', 'Tugas ini tidak menunggu tugas lain.')}
          </div>
        ) : (
          blockers.map(b => {
            const done = isItemDone(b, statuses);
            return (
              <div
                key={b.id}
                className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-2.5 py-1.5 group/dep"
              >
                {done ? (
                  <CheckCircle2 size={13} className="text-brand-teal shrink-0" />
                ) : (
                  <Lock size={12} className="text-amber-500 shrink-0" />
                )}
                <span className={`text-[11px] font-bold flex-1 truncate ${done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-brand-text dark:text-gray-100'}`}>
                  {parseStoryPoints(b.title).cleanTitle}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeDependency(b.id)}
                  title={tr(t, 'wsRemoveBlocker', 'Hapus ketergantungan')}
                  className="text-gray-300 hover:text-red-500 opacity-60 group-hover/dep:opacity-100 transition-opacity cursor-pointer shrink-0 disabled:opacity-30"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}

        {adding && (
          <div className="pt-1.5 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                placeholder={tr(t, 'wsSearchTask', 'Cari tugas...')}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-7 pr-7 py-1.5 text-[11px] font-semibold text-brand-text dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <button
                type="button"
                onClick={() => { setAdding(false); setQuery(''); setError(''); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1">
              {candidates.length === 0 ? (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center py-2 font-semibold">
                  {tr(t, 'wsNoTaskFound', 'Tidak ada tugas yang cocok.')}
                </div>
              ) : (
                candidates.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={busy}
                    onClick={() => addDependency(c.id)}
                    className="w-full text-left text-[11px] font-bold text-brand-text dark:text-gray-100 bg-white dark:bg-gray-900 hover:bg-brand-orange/10 border border-gray-100 dark:border-gray-700 rounded-xl px-2.5 py-1.5 truncate cursor-pointer transition-colors disabled:opacity-40"
                  >
                    {parseStoryPoints(c.title).cleanTitle}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-1.5 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-2.5 py-1.5 animate-in fade-in">
            <AlertTriangle size={12} className="shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DependencyEditor;
