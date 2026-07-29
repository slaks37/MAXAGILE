/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Settings, FolderKanban, Plus, Menu, X, ChevronLeft, ChevronRight, Search, TrendingUp, AlertTriangle, Clock, Download, Upload, Trash2, Moon, Sun, Monitor, BarChart3, Zap, LogOut, Loader2 } from 'lucide-react';
import { Workspace, WorkItem } from './types';
import { WorkspaceView } from './components/WorkspaceView';
import { MyTasksView } from './components/MyTasksView';
import { CalendarView } from './components/CalendarView';
import { LearningHub } from './components/learning/LearningHub';
import { GraduationCap } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginView } from './components/LoginView';

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

interface DashboardStats {
  totalWorkspaces: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  recentTasks: number;
  highPriority: number;
  inProgressTasks: number;
  recentActivity: (WorkItem & { workspace?: Workspace })[];
  upcomingTasks: (WorkItem & { workspace?: Workspace })[];
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { t } = useLanguage();
  const { user, loading: authLoading, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<{ type: string; id?: string; name?: string; initialTaskId?: string }>({ type: 'dashboard' });
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceTemplate, setNewWorkspaceTemplate] = useState("Pendidikan");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [allTasks, setAllTasks] = useState<WorkItem[]>([]);
  const [searching, setSearching] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('maxagile-theme') as 'light' | 'dark' | 'system') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('maxagile-theme', darkMode);
    const root = document.documentElement;
    if (darkMode === 'dark' || (darkMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (user && searchQuery.trim() !== "") {
      setSearching(true);
      fetch('/api/tasks', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setAllTasks(data);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    }
  }, [searchQuery, user]);

  const matchedWorkspaces = searchQuery.trim() === "" ? [] : workspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (ws.description && ws.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const matchedTasks = searchQuery.trim() === "" ? [] : allTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const templates = [
    "Pendidikan",
    "Pengajar",
    "Marketing",
    "Sales", 
    "Toko Kelontong",
    "UMKM",
    "Restoran",
    "Fotografer",
    "Mahasiswa",
    "IT / Software"
  ];

  const fetchWorkspaces = async () => {
    setLoading(true);
    const res = await fetch('/api/workspaces');
    if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      // Silently fail
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchWorkspaces();
    fetchStats();
  }, [user]);

  // Re-fetch stats when navigating to dashboard
  useEffect(() => {
    if (user && activeView.type === 'dashboard') {
      fetchStats();
    }
  }, [activeView.type, user]);

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newWorkspaceName, description: "", type: newWorkspaceTemplate })
    });
    const newWorkspace = await res.json();
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveView({ type: 'workspace', id: newWorkspace.id, name: newWorkspace.name });
    setShowNewWorkspaceModal(false);
    setNewWorkspaceName("");
    setNewWorkspaceTemplate("Pendidikan");
    setMobileMenuOpen(false);
  };

  const handleNavClick = (view: { type: string; id?: string; name?: string }) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  // Settings handlers
  const handleExportData = async () => {
    try {
      const res = await fetch('/api/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maxagile-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Gagal mengekspor data.');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const result = await res.json();
          alert(`Berhasil mengimpor ${result.imported} ruang kerja!`);
          fetchWorkspaces();
          fetchStats();
        } else {
          alert('Gagal mengimpor data.');
        }
      } catch (e) {
        alert('Format file tidak valid.');
      }
    };
    input.click();
  };

  const handleResetData = async () => {
    if (!confirm('⚠️ PERINGATAN: Ini akan menghapus SEMUA data (ruang kerja, tugas, status). Lanjutkan?')) return;
    if (!confirm('Apakah Anda benar-benar yakin? Tindakan ini TIDAK DAPAT dibatalkan.')) return;
    try {
      await fetch('/api/reset', { method: 'DELETE' });
      setWorkspaces([]);
      setStats(null);
      setActiveView({ type: 'dashboard' });
      fetchWorkspaces();
      fetchStats();
      alert('Semua data berhasil dihapus.');
    } catch (e) {
      alert('Gagal menghapus data.');
    }
  };

  const renderContent = () => {
    switch (activeView.type) {
      case 'dashboard':
        return (
          <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 h-full relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/40 dark:bg-brand-orange/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 relative z-10">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-extrabold text-brand-text dark:text-white mb-4 tracking-tight leading-tight">
                  Kelola Pekerjaan Lebih Cerdas <br className="hidden md:block" />
                  <span className="text-brand-orange">dengan MaxAgile</span>
                </h1>
                
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Tingkatkan produktivitas tim Anda menggunakan metodologi Agile. Mulai atur tugas dan pantau kemajuan pekerjaan hanya dalam hitungan detik tanpa hambatan.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <button 
                    onClick={() => setShowNewWorkspaceModal(true)}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-orange text-white rounded-full font-extrabold text-lg border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 shadow-lg shadow-brand-orange/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Mulai Buat Proyek
                  </button>
                  <button 
                    onClick={() => setActiveView({ type: 'learning' })}
                    className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full font-extrabold text-lg border-2 border-gray-200 dark:border-gray-700 border-b-4 active:border-b-2 active:translate-y-1 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Pelajari Agile
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              {stats && stats.totalTasks > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <StatCard icon={<BarChart3 size={18} />} title="Total Tugas" value={String(stats.totalTasks)} color="text-brand-orange" bg="bg-brand-orange/10" />
                  <StatCard icon={<CheckSquare size={18} />} title="Selesai" value={String(stats.completedTasks)} color="text-green-600" bg="bg-green-100" />
                  <StatCard icon={<Zap size={18} />} title="Dalam Proses" value={String(stats.inProgressTasks)} color="text-blue-600" bg="bg-blue-100" />
                  <StatCard icon={<AlertTriangle size={18} />} title="Terlambat" value={String(stats.overdueTasks)} color="text-red-600" bg="bg-red-100" danger={stats.overdueTasks > 0} />
                </div>
              )}

              {/* Upcoming Tasks */}
              {stats && stats.upcomingTasks && stats.upcomingTasks.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg font-extrabold text-brand-text dark:text-white flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-brand-orange" />
                    Tugas Mendatang
                  </h2>
                  <div className="space-y-3">
                    {stats.upcomingTasks.map((task: any) => (
                      <button
                        key={task.id}
                        onClick={() => setActiveView({ type: 'workspace', id: task.workspaceId, name: task.workspace?.name, initialTaskId: task.id })}
                        className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 border-b-4 shadow-sm hover:border-brand-orange/40 hover:-translate-y-0.5 transition-all flex items-center gap-4 cursor-pointer"
                      >
                        <div className="bg-brand-orange/10 px-3 py-2 rounded-xl text-center shrink-0">
                          <div className="text-[10px] font-black text-brand-orange uppercase">{new Date(task.dueDate).toLocaleString('id-ID', { month: 'short' })}</div>
                          <div className="text-lg font-black text-brand-text dark:text-white leading-none">{new Date(task.dueDate).getDate()}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-brand-text dark:text-white text-sm truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-bold">
                            <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-md truncate max-w-[120px]">{task.workspace?.name}</span>
                            {task.status && <span>{task.status.name}</span>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {stats && stats.recentActivity && stats.recentActivity.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg font-extrabold text-brand-text dark:text-white flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-brand-orange" />
                    Aktivitas Terbaru
                  </h2>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 border-b-4 shadow-sm overflow-hidden">
                    {stats.recentActivity.slice(0, 5).map((task: any, idx: number) => (
                      <button
                        key={task.id}
                        onClick={() => setActiveView({ type: 'workspace', id: task.workspaceId, name: task.workspace?.name, initialTaskId: task.id })}
                        className={`w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${idx > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}
                      >
                        <div className="w-2 h-2 rounded-full bg-brand-orange shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold text-brand-text dark:text-white truncate block">{task.title}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{task.workspace?.name} • {task.status?.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold shrink-0">
                          {new Date(task.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ruang Kerja Anda Catalog */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-extrabold text-brand-text dark:text-white flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-brand-orange" />
                    Ruang Kerja Anda
                  </h2>
                  <button 
                    onClick={() => setShowNewWorkspaceModal(true)}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 px-4.5 py-2.5 rounded-full transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Tambah Ruang Kerja
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-sm text-gray-400 font-semibold animate-pulse">Memuat ruang kerja...</div>
                ) : workspaces.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-12 text-center">
                    <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-bold mb-4">Belum ada ruang kerja yang aktif.</p>
                    <button 
                      onClick={() => setShowNewWorkspaceModal(true)}
                      className="px-6 py-3 bg-brand-orange text-white rounded-full font-bold text-sm shadow-sm hover:bg-brand-orange/95 cursor-pointer"
                    >
                      Buat Ruang Kerja Pertama Anda
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {workspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => setActiveView({ type: 'workspace', id: ws.id, name: ws.name })}
                        className="text-left bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-700 border-b-4 hover:border-brand-orange/40 hover:-translate-y-1 transition-all group shadow-sm flex flex-col justify-between h-40 cursor-pointer"
                      >
                        <div>
                          <span className="text-[10px] font-extrabold text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {ws.type}
                          </span>
                          <h3 className="font-extrabold text-lg text-brand-text dark:text-white group-hover:text-brand-orange transition-colors mt-3 line-clamp-1 leading-snug">
                            {ws.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {ws.description || `Kelola tugas ${ws.type} Anda dengan diagram alur kerja Agile.`}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-gray-400 group-hover:text-brand-orange transition-colors mt-4">
                          <span>Masuk Ruang Kerja</span>
                          <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))}

                    {/* Quick Create Card */}
                    <button
                      onClick={() => setShowNewWorkspaceModal(true)}
                      className="text-center bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-orange/40 hover:bg-white dark:hover:bg-gray-800 transition-all flex flex-col items-center justify-center gap-3 h-40 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                        <Plus size={20} />
                      </div>
                      <div className="text-sm font-extrabold text-gray-500">Buat Ruang Kerja Baru</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'tasks':
        return <MyTasksView />;
      case 'calendar':
        return <CalendarView />;
      case 'learning':
        return <LearningHub />;
      case 'workspace':
        if (!activeView.id) return null;
        return <WorkspaceView 
                  key={activeView.id}
                  workspaceId={activeView.id} 
                  workspaceName={activeView.name || 'Workspace'} 
                  initialTaskId={activeView.initialTaskId}
                  onDeleteWorkspace={() => {
                     setActiveView({ type: 'dashboard' });
                     fetchWorkspaces();
                  }}
                  onWorkspaceRenamed={(newName: string) => {
                     setWorkspaces(workspaces.map(ws => ws.id === activeView.id ? { ...ws, name: newName } : ws));
                     setActiveView(prev => ({ ...prev, name: newName }));
                  }}
               />;
      case 'settings':
        return (
          <div className="flex-1 overflow-auto p-6 bg-brand-bg dark:bg-gray-900">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-brand-text dark:text-white mb-2">Pengaturan Aplikasi</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sesuaikan pengalaman MaxAgile Anda.</p>
              </div>

              {/* Theme */}
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <h4 className="font-extrabold text-brand-text dark:text-white mb-4 flex items-center gap-2">
                  {darkMode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  Tema Tampilan
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'light' as const, icon: <Sun size={18} />, label: 'Terang' },
                    { val: 'dark' as const, icon: <Moon size={18} />, label: 'Gelap' },
                    { val: 'system' as const, icon: <Monitor size={18} />, label: 'Sistem' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setDarkMode(opt.val)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        darkMode === opt.val 
                          ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' 
                          : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.icon}
                      <span className="text-xs font-extrabold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <h4 className="font-extrabold text-brand-text dark:text-white mb-4 flex items-center gap-2">
                  <Download size={18} />
                  Manajemen Data
                </h4>
                <div className="space-y-3">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 shrink-0">
                      <Download size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-text dark:text-white">Ekspor Data</p>
                      <p className="text-xs text-gray-400">Unduh cadangan semua ruang kerja dan tugas Anda dalam format JSON</p>
                    </div>
                  </button>

                  <button
                    onClick={handleImportData}
                    className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 shrink-0">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-text dark:text-white">Impor Data</p>
                      <p className="text-xs text-gray-400">Pulihkan dari file cadangan JSON</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900 rounded-2xl p-6 shadow-sm">
                <h4 className="font-extrabold text-red-600 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Zona Berbahaya
                </h4>
                <button
                  onClick={handleResetData}
                  className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-left cursor-pointer w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 shrink-0">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-600">Hapus Semua Data</p>
                    <p className="text-xs text-red-400">Menghapus seluruh ruang kerja, tugas, dan status. Tidak dapat dibatalkan.</p>
                  </div>
                </button>
              </div>

              {/* About */}
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <h4 className="font-extrabold text-brand-text dark:text-white mb-3">Tentang MaxAgile</h4>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p><strong>Versi:</strong> 2.0.0</p>
                  <p><strong>Database:</strong> SQLite (Lokal)</p>
                  <p><strong>Framework:</strong> React + Vite + Express + Prisma</p>
                  <p className="text-xs pt-2 border-t border-gray-100 dark:border-gray-700 mt-3">MaxAgile adalah platform manajemen proyek dengan metodologi Agile yang mendukung Kanban, Scrum, dan Waterfall.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // --- Auth gate -------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg dark:bg-gray-900">
        <Loader2 className="w-7 h-7 text-brand-orange animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-brand-text dark:text-white font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/50 z-40" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        ${sidebarCollapsed ? "w-20" : "w-64"} bg-white dark:bg-gray-900 flex flex-col border-r-2 border-gray-100 dark:border-gray-800 transition-all duration-300
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`p-5 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && <h1 className="text-xl font-bold flex items-center gap-2 text-brand-text dark:text-white">
            <CheckSquare className="w-6 h-6 text-brand-orange" />
            MaxAgile
          </h1>}
          <button className="md:hidden text-gray-500 hover:bg-gray-200 p-1 rounded-md" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
          <button className="hidden md:flex text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {!sidebarCollapsed ? <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-3">Menu</div> : <div className="h-4 mt-4 mb-2"></div>}
          <NavItem collapsed={sidebarCollapsed} 
            icon={<LayoutDashboard size={18} />} 
            label={t('dashboard')} 
            active={activeView.type === 'dashboard'} 
            onClick={() => handleNavClick({ type: 'dashboard' })} 
          />
          <NavItem collapsed={sidebarCollapsed} 
            icon={<CheckSquare size={18} />} 
            label={t('myTasks')} 
            active={activeView.type === 'tasks'} 
            onClick={() => handleNavClick({ type: 'tasks' })} 
          />
          <NavItem collapsed={sidebarCollapsed} 
            icon={<CalendarIcon size={18} />} 
            label={t('calendar')} 
            active={activeView.type === 'calendar'} 
            onClick={() => handleNavClick({ type: 'calendar' })} 
          />
          <NavItem collapsed={sidebarCollapsed} 
            icon={<GraduationCap size={18} />} 
            label={t('learningHub')} 
            active={activeView.type === 'learning'} 
            onClick={() => handleNavClick({ type: 'learning' })} 
          />
          
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 px-3 group`}>
            {!sidebarCollapsed && <span>{t('workspaces')}</span>}
            <button onClick={() => setShowNewWorkspaceModal(true)} className={`text-gray-400 hover:text-brand-orange transition-opacity ${sidebarCollapsed ? "opacity-100 p-1 bg-gray-100 rounded-md" : "opacity-0 group-hover:opacity-100"}`}><Plus size={16} /></button>
          </div>
          
          {loading ? (
            (!sidebarCollapsed ? <div className="text-sm text-gray-500 py-2 px-3">Memuat...</div> : null)
          ) : workspaces.length === 0 ? (
            (!sidebarCollapsed ? <div className="text-sm text-gray-500 py-2 px-3">Belum ada ruang kerja.</div> : null)
          ) : (
            workspaces.map(ws => (
              <NavItem collapsed={sidebarCollapsed} 
                key={ws.id} 
                icon={<FolderKanban size={18} />} 
                label={ws.name} 
                active={activeView.type === 'workspace' && activeView.id === ws.id}
                onClick={() => handleNavClick({ type: 'workspace', id: ws.id, name: ws.name })}
              />
            ))
          )}
        </nav>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2">
          <NavItem collapsed={sidebarCollapsed}
            icon={<Settings size={18} />}
            label={t('settings')}
            active={activeView.type === 'settings'}
            onClick={() => handleNavClick({ type: 'settings' })}
          />

          {/* Signed-in user chip */}
          <div className={`flex items-center gap-2 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 ${sidebarCollapsed ? 'flex-col p-2' : 'p-2'}`}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0 shadow-sm"
              style={{ backgroundColor: user.color || '#F3A733' }}
              title={user.name}
            >
              {initialsOf(user.name)}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-brand-text dark:text-white truncate leading-tight">{user.name}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate leading-tight">@{user.username}</p>
              </div>
            )}
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              title={tr(t, 'authLogout', 'Keluar')}
              aria-label={tr(t, 'authLogout', 'Keluar')}
              className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 h-full relative overflow-hidden">
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0 bg-white dark:bg-gray-900 sticky top-0 z-30 gap-4">
          <div className="flex items-center min-w-0">
            <button 
              className="mr-3 md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg shrink-0"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="font-bold text-lg md:text-xl text-brand-text dark:text-white truncate capitalize">
              {activeView.type === 'tasks' ? t('myTasks') : 
               activeView.type === 'dashboard' ? t('dashboard') : 
               activeView.type === 'calendar' ? t('calendar') : 
               activeView.type === 'learning' ? t('learningHub') : 
               activeView.type === 'settings' ? t('settings') : 
               activeView.type === 'workspace' ? `${activeView.name || t('workspaces')}` : activeView.type}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>

          {/* Global Search Bar */}
          <div className="relative max-w-xs md:max-w-md flex-1 z-50">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-brand-orange focus:border-transparent rounded-full pl-9 pr-4 py-1.5 text-sm transition-all outline-none"
            />
            
            {/* Search Results Dropdown */}
            {searchQuery.trim() !== "" && (
              <div className="absolute right-0 mt-2 w-72 md:w-[450px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 flex flex-col">
                <div className="overflow-y-auto p-2 space-y-3 custom-scrollbar bg-white dark:bg-gray-800">
                  {searching ? (
                    <div className="p-4 text-center text-sm text-gray-500 animate-pulse">Mencari...</div>
                  ) : matchedWorkspaces.length === 0 && matchedTasks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 font-semibold">Tidak ada hasil ditemukan</div>
                  ) : (
                    <>
                      {matchedWorkspaces.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">Ruang Kerja ({matchedWorkspaces.length})</div>
                          <div className="space-y-0.5">
                            {matchedWorkspaces.map(ws => (
                              <button
                                key={ws.id}
                                onClick={() => {
                                  setActiveView({ type: 'workspace', id: ws.id, name: ws.name });
                                  setSearchQuery("");
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-brand-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <FolderKanban size={14} className="text-brand-orange shrink-0" />
                                <span className="truncate">{ws.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {matchedTasks.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">Tugas ({matchedTasks.length})</div>
                          <div className="space-y-0.5">
                            {matchedTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => {
                                  setActiveView({ 
                                    type: 'workspace', 
                                    id: task.workspaceId, 
                                    name: task.workspace?.name || 'Workspace', 
                                    initialTaskId: task.id 
                                  });
                                  setSearchQuery("");
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col cursor-pointer"
                              >
                                <div className="flex items-center gap-2 justify-between w-full">
                                  <span className="font-semibold text-brand-text dark:text-white truncate">{task.title}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                                    task.priority === 'High' || task.priority === 'Mendesak' || task.priority === 'Tinggi' ? 'bg-red-100 text-red-600' :
                                    task.priority === 'Medium' || task.priority === 'Sedang' ? 'bg-orange-100 text-orange-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {task.priority || 'Normal'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mt-0.5">
                                  <span className="truncate">{task.workspace?.name}</span>
                                  <span>•</span>
                                  <span>{task.status?.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {renderContent()}
      </main>

      {/* New Workspace Modal */}
      {showNewWorkspaceModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white dark:border-gray-700">
            <h3 className="text-2xl font-extrabold mb-6 text-brand-text dark:text-white">Buat Ruang Kerja Baru</h3>
            <input 
              type="text" 
              placeholder="Nama Ruang Kerja" 
              className="w-full bg-white/60 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-inner mb-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createWorkspace()}
              autoFocus
            />
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Template</label>
              <select
                className="w-full bg-white/60 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                value={newWorkspaceTemplate}
                onChange={(e) => setNewWorkspaceTemplate(e.target.value)}
              >
                {templates.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowNewWorkspaceModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={createWorkspace}
                className="px-5 py-2.5 text-sm font-bold text-white bg-brand-text hover:bg-black rounded-full shadow-sm transition-colors cursor-pointer"
              >
                Buat Ruang Kerja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, collapsed = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, collapsed?: boolean, onClick?: () => void, key?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${collapsed ? 'justify-center px-0' : 'px-4'} ${active ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800 hover:text-brand-text dark:hover:text-white'}`}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

function StatCard({ icon, title, value, color, bg, danger = false }: { icon: React.ReactNode, title: string, value: string, color: string, bg: string, danger?: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-700 border-b-4 shadow-sm ${danger ? 'border-red-200 dark:border-red-900' : ''}`}>
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} mb-3`}>
        {icon}
      </div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</div>
      <div className={`text-2xl font-extrabold mt-1 ${danger ? 'text-red-600' : 'text-brand-text dark:text-white'}`}>{value}</div>
    </div>
  );
}
