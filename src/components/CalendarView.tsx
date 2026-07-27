import { useState, useEffect, useMemo } from 'react';
import { WorkItem } from '../types';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ListTodo, Filter, X, Flag } from 'lucide-react';

type ViewMode = 'harian' | 'mingguan' | 'bulanan';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sunday
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function getWeekDates(refDate: Date): Date[] {
  const d = new Date(refDate);
  const day = d.getDay(); // 0=Sun
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - day + 1); // Monday
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(startOfWeek);
    dd.setDate(startOfWeek.getDate() + i);
    dates.push(dd);
  }
  return dates;
}

const PRIORITY_MAP: Record<string, string> = {
  'tinggi': 'high', 'mendesak': 'high', 'high': 'high', 'urgent': 'high',
  'sedang': 'medium', 'medium': 'medium',
  'rendah': 'low', 'low': 'low',
};

function getPriorityColor(priority: string) {
  const p = (priority || '').toLowerCase();
  const mapped = PRIORITY_MAP[p] || 'normal';
  switch (mapped) {
    case 'high': return 'bg-red-100 text-red-600 border-red-200';
    case 'medium': return 'bg-orange-100 text-orange-600 border-orange-200';
    case 'low': return 'bg-blue-100 text-blue-600 border-blue-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function getPriorityDot(priority: string) {
  const p = (priority || '').toLowerCase();
  const mapped = PRIORITY_MAP[p] || 'normal';
  switch (mapped) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-orange-400';
    case 'low': return 'bg-blue-400';
    default: return 'bg-gray-400';
  }
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_NAMES_FULL = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export function CalendarView() {
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('bulanan');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (filterPriority === 'all') return true;
      const p = (task.priority || '').toLowerCase();
      switch (filterPriority) {
        case 'high': return p === 'tinggi' || p === 'mendesak' || p === 'high' || p === 'urgent';
        case 'medium': return p === 'sedang' || p === 'medium';
        case 'low': return p === 'rendah' || p === 'low';
        default: return true;
      }
    });
  }, [tasks, filterPriority]);

  // Tasks indexed by date string for fast lookup
  const tasksByDate = useMemo(() => {
    const map: Record<string, WorkItem[]> = {};
    filteredTasks.forEach(task => {
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (!map[key]) map[key] = [];
          map[key].push(task);
        }
      }
    });
    return map;
  }, [filteredTasks]);

  // Upcoming tasks (tasks with due dates sorted)
  const upcomingTasks = useMemo(() => {
    return filteredTasks
      .filter(t => t.dueDate && !isNaN(new Date(t.dueDate).getTime()))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [filteredTasks]);

  const getTasksForDate = (date: Date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return tasksByDate[key] || [];
  };

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    if (viewMode === 'bulanan') {
      d.setMonth(d.getMonth() + dir);
    } else if (viewMode === 'mingguan') {
      d.setDate(d.getDate() + dir * 7);
    } else {
      d.setDate(d.getDate() + dir);
    }
    setCurrentDate(d);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const currentMonthLabel = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const currentDayLabel = currentDate.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const today = new Date();

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-brand-bg">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-bold">Memuat kalender...</p>
      </div>
    </div>
  );

  // MONTHLY GRID
  const renderMonthlyGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    let firstDay = getFirstDayOfMonth(year, month);
    // Adjust Sunday from 0 to 7 for Monday-start grid
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const cells: { day: number | null; date: Date | null }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, date: null });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, date: new Date(year, month, d) });
    }
    // Fill remaining cells
    while (cells.length % 7 !== 0) cells.push({ day: null, date: null });

    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-sm overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES.map(name => (
            <div key={name} className="py-3 text-center text-xs font-extrabold text-gray-400 uppercase tracking-widest">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            if (!cell.date || cell.day === null) {
              return <div key={idx} className="min-h-[100px] md:min-h-[120px] bg-gray-50/30 border-b border-r border-gray-100/50" />;
            }

            const dayTasks = getTasksForDate(cell.date);
            const isToday = isSameDay(cell.date, today);
            const isSelected = selectedDate && isSameDay(cell.date, selectedDate);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(cell.date)}
                className={`min-h-[100px] md:min-h-[120px] p-2 border-b border-r border-gray-100/50 text-left transition-all hover:bg-brand-orange/5 flex flex-col cursor-pointer ${
                  isSelected ? 'bg-brand-orange/10 ring-2 ring-brand-orange ring-inset' : ''
                } ${isToday ? 'bg-blue-50/50' : ''}`}
              >
                <span className={`text-sm font-extrabold inline-flex items-center justify-center w-7 h-7 rounded-full ${
                  isToday ? 'bg-brand-orange text-white' : 'text-gray-700'
                }`}>
                  {cell.day}
                </span>
                
                <div className="flex-1 mt-1 space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center gap-1 text-[10px] font-bold text-gray-600 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityDot(task.priority)}`} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] font-bold text-brand-orange">+{dayTasks.length - 3} lagi</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // WEEKLY VIEW
  const renderWeeklyView = () => {
    const weekDates = getWeekDates(currentDate);

    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-gray-100">
          {weekDates.map((date, idx) => {
            const dayTasks = getTasksForDate(date);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`p-3 min-h-[300px] flex flex-col text-left transition-all hover:bg-brand-orange/5 cursor-pointer ${
                  isSelected ? 'bg-brand-orange/10 ring-2 ring-brand-orange ring-inset' : ''
                } ${isToday ? 'bg-blue-50/30' : ''}`}
              >
                <div className="text-center mb-3">
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{DAY_NAMES_FULL[idx]}</div>
                  <span className={`text-lg font-extrabold inline-flex items-center justify-center w-9 h-9 rounded-full mt-1 ${
                    isToday ? 'bg-brand-orange text-white' : 'text-gray-700'
                  }`}>
                    {date.getDate()}
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                  {dayTasks.map(task => (
                    <div key={task.id} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <p className="text-xs font-bold text-brand-text line-clamp-2 leading-snug">{task.title}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.workspace && (
                          <span className="text-[8px] font-bold text-gray-400 truncate max-w-[60px]">{task.workspace.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="text-[10px] text-gray-300 text-center pt-4 font-medium italic">Kosong</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // DAILY VIEW
  const renderDailyView = () => {
    const dayTasks = getTasksForDate(currentDate);
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00

    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-sm overflow-hidden max-w-3xl mx-auto">
        <div className="px-6 py-4 bg-white/60 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-brand-text text-lg">
              {currentDate.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              {dayTasks.length} tugas dijadwalkan
            </p>
          </div>
          {isSameDay(currentDate, today) && (
            <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-extrabold rounded-full">Hari Ini</span>
          )}
        </div>

        <div className="divide-y divide-gray-100/50">
          {hours.map(hour => {
            const hourTasks = dayTasks.filter(task => {
              if (!task.dueDate) return false;
              const d = new Date(task.dueDate);
              return d.getHours() === hour;
            });

            // Place unassigned-hour tasks at 09:00 slot
            const unscheduledTasks = hour === 9 
              ? dayTasks.filter(task => {
                  if (!task.dueDate) return false;
                  const d = new Date(task.dueDate);
                  return d.getHours() === 0; // Midnight = no specific time
                }) 
              : [];

            const allSlotTasks = [...hourTasks, ...unscheduledTasks];

            return (
              <div key={hour} className="flex min-h-[56px] hover:bg-gray-50/50 transition-colors">
                <div className="w-16 shrink-0 py-3 text-right pr-3 text-xs font-bold text-gray-400">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
                <div className="flex-1 border-l border-gray-100 p-2 space-y-1.5">
                  {allSlotTasks.map(task => (
                    <div key={task.id} className="bg-brand-orange/10 border border-brand-orange/20 px-3 py-2 rounded-xl flex items-center gap-2">
                      <Flag size={12} className="text-brand-orange shrink-0" />
                      <span className="text-xs font-bold text-brand-text truncate flex-1">{task.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Selected date task panel
  const renderSelectedDatePanel = () => {
    if (!selectedDate) return null;
    const dayTasks = getTasksForDate(selectedDate);

    return (
      <div className="mt-6 bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-sm overflow-hidden max-w-3xl mx-auto">
        <div className="px-6 py-4 bg-white/60 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-brand-text">
              {selectedDate.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">{dayTasks.length} tugas</p>
          </div>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {dayTasks.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-bold">Tidak ada tugas pada tanggal ini</p>
            </div>
          ) : (
            dayTasks.map(task => (
              <div key={task.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-brand-text text-sm leading-snug">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border shrink-0 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                  {task.workspace && (
                    <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-md">{task.workspace.name}</span>
                  )}
                  {task.status && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{task.status.name}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-bg">
      <div className="bg-white px-6 pt-6 pb-2 shrink-0 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-text mb-2 tracking-tight">Kalender</h2>
            <p className="text-gray-500 mb-6 max-w-2xl">Lihat jadwal dan tenggat waktu tugas Anda yang akan datang.</p>
          </div>
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
             <div className="flex bg-gray-100 p-1 rounded-2xl border-2 border-gray-200">
               <button 
                 onClick={() => setViewMode('harian')}
                 className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'harian' ? 'bg-white text-brand-text shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Harian
               </button>
               <button 
                 onClick={() => setViewMode('mingguan')}
                 className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'mingguan' ? 'bg-white text-brand-text shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Mingguan
               </button>
               <button 
                 onClick={() => setViewMode('bulanan')}
                 className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'bulanan' ? 'bg-white text-brand-text shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Bulanan
               </button>
             </div>
             
             <div className="flex items-center gap-2">
                 <button 
                   onClick={() => navigate(-1)}
                   className="p-3 bg-white border-2 border-gray-200 border-b-4 rounded-2xl text-gray-600 hover:bg-gray-50 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all cursor-pointer"
                 >
                    <ChevronLeft size={20} />
                 </button>
                 <button 
                   onClick={goToToday}
                   className="px-4 py-3 sm:px-5 bg-white border-2 border-gray-200 border-b-4 rounded-2xl font-extrabold text-brand-text hover:bg-gray-50 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all flex items-center gap-2 cursor-pointer"
                 >
                    <CalendarIcon size={18} className="text-brand-orange" /> 
                    <span className="hidden sm:inline">{viewMode === 'harian' ? currentDayLabel : currentMonthLabel}</span>
                    <span className="sm:hidden">Hari Ini</span>
                 </button>
                 <button 
                   onClick={() => navigate(1)}
                   className="p-3 bg-white border-2 border-gray-200 border-b-4 rounded-2xl text-gray-600 hover:bg-gray-50 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all cursor-pointer"
                 >
                    <ChevronRight size={20} />
                 </button>
                 
                 <div className="relative ml-2">
                    <button 
                      onClick={() => setShowFilter(!showFilter)}
                      className="p-3 bg-white border-2 border-gray-200 border-b-4 rounded-2xl text-gray-600 hover:bg-gray-50 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center relative cursor-pointer"
                    >
                        <Filter size={20} />
                        {filterPriority !== 'all' && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-orange"></span>
                        )}
                    </button>
                    {showFilter && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-gray-100 border-b-4 rounded-2xl shadow-lg z-20 p-2">
                        <div className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase">Prioritas</div>
                        {[
                          { val: 'all', label: 'Semua', activeClass: 'bg-brand-orange/10 text-brand-orange' },
                          { val: 'high', label: 'Tinggi / Mendesak', activeClass: 'bg-red-50 text-red-600' },
                          { val: 'medium', label: 'Sedang', activeClass: 'bg-orange-50 text-orange-600' },
                          { val: 'low', label: 'Rendah', activeClass: 'bg-gray-100 text-gray-700' },
                        ].map(opt => (
                          <button 
                            key={opt.val}
                            onClick={() => { setFilterPriority(opt.val); setShowFilter(false); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold mb-1 transition-colors cursor-pointer ${filterPriority === opt.val ? opt.activeClass : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                 </div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {viewMode === 'bulanan' && renderMonthlyGrid()}
          {viewMode === 'mingguan' && renderWeeklyView()}
          {viewMode === 'harian' && renderDailyView()}

          {/* Selected Date Task Panel */}
          {(viewMode === 'bulanan' || viewMode === 'mingguan') && renderSelectedDatePanel()}

          {/* Upcoming Tasks Summary */}
          {upcomingTasks.length > 0 && (
            <div className="mt-6 max-w-3xl mx-auto">
              <h4 className="text-sm font-extrabold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                <ListTodo size={18} /> Batas Waktu Mendatang
              </h4>
              <div className="space-y-3">
                {upcomingTasks.map(task => {
                  const dueDate = new Date(task.dueDate!);
                  const isOverdue = dueDate < today;
                  return (
                    <div key={task.id} className={`bg-white p-4 rounded-2xl border-2 border-gray-100 border-b-4 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 transition-all ${isOverdue ? 'border-red-200' : ''}`}>
                      <div className={`px-3 py-2 rounded-xl text-center shrink-0 border-2 ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-brand-bg border-gray-100'}`}>
                        <div className={`text-xs font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : 'text-brand-orange'}`}>
                          {dueDate.toLocaleString('id-ID', { month: 'short' })}
                        </div>
                        <div className={`text-xl font-black leading-none mt-1 ${isOverdue ? 'text-red-600' : 'text-brand-text'}`}>
                          {dueDate.getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-extrabold text-brand-text leading-tight truncate">{task.title}</h5>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-bold text-gray-400">
                          {task.workspace && (
                            <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-md truncate max-w-[120px]">
                              {task.workspace.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {dueDate.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          {isOverdue && <span className="text-red-500 font-extrabold">Terlambat!</span>}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border shrink-0 ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
