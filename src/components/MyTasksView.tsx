import { useState, useEffect } from 'react';
import { WorkItem } from '../types';
import { CheckCircle, Clock, Filter, Inbox } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

function initialsOf(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Scope = 'mine' | 'all';

export function MyTasksView() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [scope, setScope] = useState<Scope>('mine');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/tasks', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (cancelled) return;
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-brand-bg dark:bg-gray-900">
      <div className="text-brand-orange font-bold animate-pulse">
        {tr(t, 'tasksLoading', 'Memuat tugas...')}
      </div>
    </div>
  );

  const scopedTasks = scope === 'mine'
    ? tasks.filter(task => !!user && (task as any).assigneeId === user.id)
    : tasks;

  const filteredTasks = scopedTasks.filter(task => {
    if (filterPriority === 'all') return true;
    const p = (task.priority || '').toLowerCase();
    switch (filterPriority) {
      case 'high': return p === 'tinggi' || p === 'mendesak' || p === 'high' || p === 'urgent';
      case 'medium': return p === 'sedang' || p === 'medium';
      case 'low': return p === 'rendah' || p === 'low';
      default: return true;
    }
  });

  const mineCount = user ? tasks.filter(task => (task as any).assigneeId === user.id).length : 0;

  const renderTaskLabels = (labelsJson: string | null | undefined) => {
    if (!labelsJson) return null;
    try {
      const parsed = JSON.parse(labelsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (
          <div className="flex flex-wrap gap-1 mt-2">
            {parsed.map((lbl: { name: string; color: string }, idx: number) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: lbl.color || '#3b82f6' }}
              >
                {lbl.name}
              </span>
            ))}
          </div>
        );
      }
    } catch (e) {}
    return null;
  };

  const segments: { key: Scope; label: string }[] = [
    { key: 'mine', label: tr(t, 'tasksScopeMine', 'Tugas Saya') },
    { key: 'all', label: tr(t, 'tasksScopeAll', 'Semua Tugas') },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-bg dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-900 px-4 sm:px-6 pt-6 pb-2 shrink-0 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-blue dark:bg-brand-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-brand-text dark:text-white mb-2 tracking-tight">
              {tr(t, 'tasksScopeMine', 'Tugas Saya')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-2xl">
              {scope === 'mine'
                ? tr(t, 'tasksMineSubtitle', 'Semua pekerjaan yang ditugaskan kepada Anda, dari seluruh ruang kerja.')
                : tr(t, 'tasksAllSubtitle', 'Semua pekerjaan di seluruh ruang kerja, siapa pun penanggung jawabnya.')}
            </p>

            {/* Segmented control: mine / everything */}
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 mb-6">
              {segments.map(seg => (
                <button
                  key={seg.key}
                  onClick={() => setScope(seg.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    scope === seg.key
                      ? 'bg-white dark:bg-gray-900 text-brand-orange shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-brand-text dark:hover:text-white'
                  }`}
                >
                  {seg.label}
                  {seg.key === 'mine' && mineCount > 0 && (
                    <span className="ml-1.5 text-[10px] font-black opacity-70">{mineCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 relative shrink-0">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 border-b-4 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
            >
              <Filter size={16} /> {tr(t, 'filter', 'Filter')}
              {filterPriority !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-brand-orange ml-1"></span>
              )}
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 border-b-4 rounded-2xl shadow-lg z-20 p-2">
                <div className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase">{tr(t, 'priority', 'Prioritas')}</div>
                <button
                  onClick={() => { setFilterPriority('all'); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold mb-1 transition-colors cursor-pointer ${filterPriority === 'all' ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {tr(t, 'priorityAll', 'Semua Prioritas')}
                </button>
                <button
                  onClick={() => { setFilterPriority('high'); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold mb-1 transition-colors cursor-pointer ${filterPriority === 'high' ? 'bg-red-50 dark:bg-red-900/30 text-red-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {tr(t, 'priorityHigh', 'Prioritas Tinggi')}
                </button>
                <button
                  onClick={() => { setFilterPriority('medium'); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold mb-1 transition-colors cursor-pointer ${filterPriority === 'medium' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {tr(t, 'priorityMedium', 'Prioritas Menengah')}
                </button>
                <button
                  onClick={() => { setFilterPriority('low'); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${filterPriority === 'low' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {tr(t, 'priorityLow', 'Prioritas Rendah')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {filteredTasks.length === 0 ? (
            scope === 'mine' && filterPriority === 'all' ? (
              /* Nothing is assigned to this person yet */
              <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 text-center rounded-3xl border-2 border-gray-100 dark:border-gray-700 border-b-4 shadow-sm animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-orange">
                  <Inbox size={30} />
                </div>
                <h3 className="text-xl font-extrabold text-brand-text dark:text-white mb-2">
                  {tr(t, 'tasksNoneAssignedTitle', 'Belum ada tugas untuk Anda')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
                  {tr(t, 'tasksNoneAssignedBody', 'Belum ada pekerjaan yang ditugaskan ke nama Anda. Begitu ada yang menugaskan sesuatu, tugasnya muncul di sini.')}
                </p>
                <button
                  onClick={() => setScope('all')}
                  className="mt-5 px-5 py-2.5 bg-white dark:bg-gray-700 text-brand-text dark:text-white rounded-2xl text-sm font-extrabold border-2 border-gray-200 dark:border-gray-600 border-b-4 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
                >
                  {tr(t, 'tasksSeeAllCta', 'Lihat semua tugas')}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-10 text-center rounded-3xl border-2 border-gray-100 dark:border-gray-700 border-b-4 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-brand-text dark:text-white mb-2">
                  {tr(t, 'tasksAllDoneTitle', 'Semua Selesai!')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {tr(t, 'tasksAllDoneBody', 'Tidak ada tugas yang cocok dengan filter ini.')}
                </p>
                {filterPriority !== 'all' && (
                  <button
                    onClick={() => setFilterPriority('all')}
                    className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                  >
                    {tr(t, 'tasksClearFilter', 'Hapus Filter')}
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => {
                const assignee = (task as any).assignee as { id: string; name: string; color: string } | null | undefined;
                return (
                  <div key={task.id} className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-3xl border-2 border-gray-100 dark:border-gray-700 border-b-4 shadow-sm hover:border-gray-200 dark:hover:border-gray-600 hover:-translate-y-1 transition-all flex items-center gap-3 sm:gap-4 group cursor-pointer">
                    <button className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-white hover:bg-brand-teal hover:border-brand-teal transition-colors shrink-0 cursor-pointer">
                      <CheckCircle size={24} className="opacity-0 group-hover:opacity-100" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-brand-text dark:text-white text-base sm:text-lg mb-1 truncate">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-blue dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="truncate max-w-[100px] sm:max-w-none">{task.workspace?.name}</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock size={14} />
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                            : tr(t, 'tasksNoDueDate', 'Tanpa batas waktu')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs uppercase tracking-wider ${
                          task.priority === 'High' || task.priority === 'Tinggi' || task.priority === 'Mendesak' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300' :
                          task.priority === 'Medium' || task.priority === 'Sedang' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {task.priority || 'Normal'}
                        </span>
                      </div>
                      {renderTaskLabels(task.labels)}
                    </div>

                    {scope === 'all' && assignee && (
                      <div
                        className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: assignee.color || '#F3A733' }}
                        title={assignee.name}
                      >
                        {initialsOf(assignee.name)}
                      </div>
                    )}

                    <div className="shrink-0 text-sm font-bold text-gray-400 hidden sm:block">
                      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-100 dark:border-gray-600 text-xs">
                        {task.status?.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
