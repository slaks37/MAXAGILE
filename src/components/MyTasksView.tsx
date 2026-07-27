import { useState, useEffect } from 'react';
import { WorkItem } from '../types';
import { CheckCircle, Clock, Calendar as CalendarIcon, Filter, X } from 'lucide-react';

export function MyTasksView() {
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-brand-bg">
        <div className="text-brand-orange font-bold animate-pulse">Memuat tugas...</div>
    </div>
  );

  const filteredTasks = tasks.filter(task => {
    if (filterPriority === 'all') return true;
    const p = (task.priority || '').toLowerCase();
    switch (filterPriority) {
      case 'high': return p === 'tinggi' || p === 'mendesak' || p === 'high' || p === 'urgent';
      case 'medium': return p === 'sedang' || p === 'medium';
      case 'low': return p === 'rendah' || p === 'low';
      default: return true;
    }
  });

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-bg">
      <div className="bg-white px-6 pt-6 pb-2 shrink-0 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-blue rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-text mb-2 tracking-tight">Tugas Saya</h2>
            <p className="text-gray-500 mb-6 max-w-2xl">Pantau semua pekerjaan yang ditugaskan kepada Anda dari berbagai ruang kerja.</p>
          </div>
          <div className="mb-6 relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 border-b-4 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all"
            >
                <Filter size={16} /> Filter
                {filterPriority !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-brand-orange ml-1"></span>
                )}
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-gray-100 border-b-4 rounded-2xl shadow-lg z-20 p-2">
                <div className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase">Prioritas</div>
                <button 
                  onClick={() => { setFilterPriority('all'); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold mb-1 transition-colors ${filterPriority === 'all' ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Semua Tugas
                </button>
                <button 
                  onClick={() => { setFilterPriority('high'); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold mb-1 transition-colors ${filterPriority === 'high' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Prioritas Tinggi
                </button>
                <button 
                  onClick={() => { setFilterPriority('medium'); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold mb-1 transition-colors ${filterPriority === 'medium' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Prioritas Menengah
                </button>
                <button 
                  onClick={() => { setFilterPriority('low'); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors ${filterPriority === 'low' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Prioritas Rendah
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {filteredTasks.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-3xl border-2 border-gray-100 border-b-4 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-brand-text mb-2">Semua Selesai!</h3>
                <p className="text-gray-500 font-medium">Anda tidak memiliki tugas yang tersisa saat ini.</p>
                {filterPriority !== 'all' && (
                  <button onClick={() => setFilterPriority('all')} className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors">
                    Hapus Filter
                  </button>
                )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <div key={task.id} className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-gray-100 border-b-4 shadow-sm hover:border-gray-200 hover:-translate-y-1 transition-all flex items-center gap-4 group cursor-pointer">
                  <button className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-white hover:bg-brand-teal hover:border-brand-teal transition-colors shrink-0">
                    <CheckCircle size={24} className="opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-brand-text text-base sm:text-lg mb-1 truncate">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-500">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-blue text-blue-700 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="truncate max-w-[100px] sm:max-w-none">{task.workspace?.name}</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock size={14} />
                        <span className="hidden sm:inline">Batas:</span> Segera
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs uppercase tracking-wider ${
                        task.priority === 'High' || task.priority === 'Tinggi' || task.priority === 'Mendesak' ? 'bg-red-100 text-red-600' :
                        task.priority === 'Medium' || task.priority === 'Sedang' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {task.priority || 'Normal'}
                      </span>
                    </div>
                    {renderTaskLabels(task.labels)}
                  </div>
                  <div className="shrink-0 text-sm font-bold text-gray-400 hidden sm:block">
                     <div className="px-3 py-1.5 bg-gray-50 rounded-xl border-2 border-gray-100 text-xs">
                         {task.status?.name}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
