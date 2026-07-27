import React, { useState, useEffect } from 'react';
import { Workspace, Status, WorkItem } from '../types';
import { Trash2, Plus, GripVertical, Calendar as CalendarIcon, Flag, Edit2, X, CheckSquare, Clock, LayoutGrid, Star, Sparkles } from 'lucide-react';

interface Props {
  key?: string;
  workspaceId: string;
  workspaceName: string;
  onDeleteWorkspace: () => void;
  onWorkspaceRenamed?: (newName: string) => void;
  initialTaskId?: string;
}

function parseStoryPoints(title: string) {
  const match = title.match(/^\((\d+)\)\s*(.*)/);
  if (match) {
    return { points: match[1], cleanTitle: match[2] };
  }
  return { points: null, cleanTitle: title };
}

function formatActivityDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

export function WorkspaceView({ workspaceId, workspaceName, onDeleteWorkspace, onWorkspaceRenamed, initialTaskId }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(workspaceName);
  const [workspaceData, setWorkspaceData] = useState<{statuses: Status[], workItems: WorkItem[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kanban' | 'scrum' | 'waterfall' | 'list'>('kanban');
  
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatusId, setNewTaskStatusId] = useState<string | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState("Sedang");

  // Premium Features States
  const [selectedTask, setSelectedTask] = useState<WorkItem | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("Sedang");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskStatusId, setEditTaskStatusId] = useState("");
  const [editTaskStoryPoints, setEditTaskStoryPoints] = useState("0");
  const [editTaskSubtasks, setEditTaskSubtasks] = useState<{ id: string; title: string; done: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Custom Labels States
  const [editTaskLabels, setEditTaskLabels] = useState<{name: string, color: string}[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");

  const [newTaskLabels, setNewTaskLabels] = useState<{name: string, color: string}[]>([]);
  const [newTLabelName, setNewTLabelName] = useState("");
  const [newTLabelColor, setNewTLabelColor] = useState("#3b82f6");

  // Custom Column States
  const [showAddColumnForm, setShowAddColumnForm] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("#3b82f6");

  // Sprint States (Jira Style)
  const [sprintName, setSprintName] = useState("Sprint Aktif 1");
  const [sprintDates, setSprintDates] = useState("12 Jul - 26 Jul • 2 Minggu");
  const [sprintGoal, setSprintGoal] = useState("Menyelesaikan implementasi fungsionalitas inti proyek");
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [tempSprintName, setTempSprintName] = useState("");
  const [tempSprintDates, setTempSprintDates] = useState("");
  const [tempSprintGoal, setTempSprintGoal] = useState("");

  const fetchWorkspace = async () => {
    setLoading(true);
    const res = await fetch(`/api/workspaces/${workspaceId}`);
    if (res.ok) {
      const data = await res.json();
      setWorkspaceData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceData && initialTaskId) {
      const taskToSelect = workspaceData.workItems.find(item => item.id === initialTaskId);
      if (taskToSelect) {
        setSelectedTask(taskToSelect);
      }
    }
  }, [workspaceData, initialTaskId]);

  useEffect(() => {
    if (selectedTask) {
      const { points, cleanTitle } = parseStoryPoints(selectedTask.title);
      setEditTaskTitle(cleanTitle);
      setEditTaskDescription(selectedTask.description || "");
      setEditTaskPriority(selectedTask.priority || "Sedang");
      setEditTaskDueDate(selectedTask.dueDate ? selectedTask.dueDate.substring(0, 10) : "");
      setEditTaskStatusId(selectedTask.statusId || "");
      setEditTaskStoryPoints(points || "0");
      try {
        const parsedLabels = selectedTask.labels ? JSON.parse(selectedTask.labels) : [];
        setEditTaskLabels(Array.isArray(parsedLabels) ? parsedLabels : []);
      } catch (err) {
        setEditTaskLabels([]);
      }
      try {
        const parsedSubtasks = selectedTask.subtasks ? JSON.parse(selectedTask.subtasks) : [];
        setEditTaskSubtasks(Array.isArray(parsedSubtasks) ? parsedSubtasks : []);
      } catch (err) {
        setEditTaskSubtasks([]);
      }
    }
  }, [selectedTask]);

  const handleDeleteWorkspace = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus ruang kerja ini? Semua data akan hilang.")) {
      await fetch(`/api/workspaces/${workspaceId}`, { method: 'DELETE' });
      onDeleteWorkspace();
    }
  };

  const createWorkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await fetch(`/api/workspaces/${workspaceId}/work-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: newTaskTitle.trim(), 
        description: newTaskDescription.trim(),
        statusId: newTaskStatusId, 
        priority: newTaskPriority,
        labels: JSON.stringify(newTaskLabels)
      })
    });
    
    setShowNewTaskModal(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskStatusId(null);
    setNewTaskPriority("Sedang");
    setNewTaskLabels([]);
    fetchWorkspace();
  };

  const createStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    await fetch(`/api/workspaces/${workspaceId}/statuses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newColumnName.trim(),
        color: newColumnColor,
        order: workspaceData ? workspaceData.statuses.length + 1 : 1
      })
    });

    setNewColumnName("");
    setNewColumnColor("#3b82f6");
    setShowAddColumnForm(false);
    fetchWorkspace();
  };

  const updateWorkItemStatus = async (itemId: string, newStatusId: string) => {
    if (workspaceData) {
      const newItems = workspaceData.workItems.map(item => 
        item.id === itemId ? { ...item, statusId: newStatusId } : item
      );
      setWorkspaceData({ ...workspaceData, workItems: newItems });
    }

    await fetch(`/api/work-items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusId: newStatusId })
    });
    
    fetchWorkspace();
  };

  const updateWorkItemDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !editTaskTitle.trim()) return;

    // Formulate final title with story points if set and > 0
    const finalTitle = editTaskStoryPoints && editTaskStoryPoints !== "0"
      ? `(${editTaskStoryPoints}) ${editTaskTitle.trim()}`
      : editTaskTitle.trim();

    await fetch(`/api/work-items/${selectedTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: finalTitle,
        description: editTaskDescription.trim(),
        priority: editTaskPriority,
        dueDate: editTaskDueDate ? new Date(editTaskDueDate).toISOString() : null,
        statusId: editTaskStatusId || null,
        labels: JSON.stringify(editTaskLabels),
        subtasks: JSON.stringify(editTaskSubtasks)
      })
    });

    setSelectedTask(null);
    fetchWorkspace();
  };

  const deleteWorkItem = async (itemId: string) => {
    if (confirm("Hapus tugas ini?")) {
       await fetch(`/api/work-items/${itemId}`, { method: 'DELETE' });
       setSelectedTask(null);
       fetchWorkspace();
    }
  };

  const renderTaskLabels = (labelsJson: string | null | undefined) => {
    if (!labelsJson) return null;
    try {
      const parsed = JSON.parse(labelsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (
          <div className="flex flex-wrap gap-1 mt-1.5 mb-1.5">
            {parsed.map((lbl: { name: string; color: string }, idx: number) => (
              <span 
                key={idx} 
                className="px-1.5 py-0.5 rounded text-[9px] font-extrabold text-white shadow-sm truncate max-w-[120px]"
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

  const getPriorityColor = (priority: string) => {
    const p = priority ? priority.toLowerCase() : '';
    switch (p) {
      case 'mendesak':
      case 'tinggi':
      case 'high':
        return 'text-red-600 bg-red-100 border border-red-200';
      case 'sedang':
      case 'medium':
        return 'text-orange-600 bg-orange-100 border border-orange-200';
      case 'rendah':
      case 'low':
        return 'text-blue-600 bg-blue-100 border border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border border-gray-200';
    }
  };

  const calculateTotalPoints = () => {
    if (!workspaceData) return 0;
    let total = 0;
    workspaceData.workItems.forEach(item => {
      const { points } = parseStoryPoints(item.title);
      if (points) {
        total += parseInt(points, 10);
      }
    });
    return total;
  };

  const handleOpenSprintModal = () => {
    setTempSprintName(sprintName);
    setTempSprintDates(sprintDates);
    setTempSprintGoal(sprintGoal);
    setShowSprintModal(true);
  };

  const handleSaveSprint = (e: React.FormEvent) => {
    e.preventDefault();
    setSprintName(tempSprintName);
    setSprintDates(tempSprintDates);
    setSprintGoal(tempSprintGoal);
    setShowSprintModal(false);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-brand-bg min-h-[400px]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 font-bold">Memuat ruang kerja...</p>
      </div>
    </div>
  );

  if (!workspaceData) return (
    <div className="p-6 text-red-500 flex-1 flex items-center justify-center h-full">
      Ruang kerja tidak ditemukan
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-brand-bg relative">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-blue/30 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-orange/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="px-8 pt-8 pb-4 bg-white/60 backdrop-blur-md border-b border-white shadow-sm flex flex-col shrink-0 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-brand-orange/10 text-brand-orange rounded-lg text-xs font-bold uppercase tracking-wider">{workspaceData.workItems.length} Tugas</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{workspaceData.statuses.length} Kolom</span>
            </div>
            {editingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={async () => {
                  if (editName.trim() && editName !== workspaceName) {
                    await fetch(`/api/workspaces/${workspaceId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: editName.trim() })
                    });
                    onWorkspaceRenamed?.(editName.trim());
                  }
                  setEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') { setEditName(workspaceName); setEditingName(false); }
                }}
                autoFocus
                className="text-3xl font-extrabold text-brand-text tracking-tight mt-1 bg-transparent border-b-2 border-brand-orange outline-none w-full"
              />
            ) : (
              <h2
                className="text-3xl font-extrabold text-brand-text tracking-tight mt-1 cursor-pointer hover:text-brand-orange transition-colors group/name"
                onClick={() => { setEditName(workspaceName); setEditingName(true); }}
                title="Klik untuk mengedit nama"
              >
                {workspaceName}
                <Edit2 size={14} className="inline ml-2 opacity-0 group-hover/name:opacity-100 transition-opacity" />
              </h2>
            )}
            <p className="text-sm text-gray-500 mt-1">Gunakan papan pintar ini untuk mempercepat kemajuan pekerjaan tim Anda.</p>
          </div>
          <button onClick={handleDeleteWorkspace} className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0 border border-red-100">
            <Trash2 size={16} /> Hapus Ruang Kerja
          </button>
        </div>
        
        <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`text-sm font-bold py-2.5 px-5 rounded-full transition-all ${activeTab === 'kanban' ? 'bg-brand-text text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-brand-text'}`}
          >Kanban</button>
          <button 
            onClick={() => setActiveTab('scrum')}
            className={`text-sm font-bold py-2.5 px-5 rounded-full transition-all ${activeTab === 'scrum' ? 'bg-brand-text text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-brand-text'}`}
          >Scrum</button>
          <button 
            onClick={() => setActiveTab('waterfall')}
            className={`text-sm font-bold py-2.5 px-5 rounded-full transition-all ${activeTab === 'waterfall' ? 'bg-brand-text text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-brand-text'}`}
          >Waterfall</button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`text-sm font-bold py-2.5 px-5 rounded-full transition-all ${activeTab === 'list' ? 'bg-brand-text text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-brand-text'}`}
          >Daftar</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 h-full relative z-10 custom-scrollbar">
        {/* TAB KANBAN */}
        {activeTab === 'kanban' && (
          <div className="flex gap-6 items-start h-full pb-8 w-max">
            {workspaceData.statuses.map(status => {
              const items = workspaceData.workItems.filter(i => i.statusId === status.id);
              return (
                <div 
                  key={status.id} 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const itemId = e.dataTransfer.getData("itemId");
                    if (itemId) updateWorkItemStatus(itemId, status.id);
                  }}
                  className="bg-white/40 rounded-3xl p-4 w-[320px] flex flex-col max-h-full shrink-0 shadow-sm border border-white/60 backdrop-blur-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-5 px-1">
                    <h4 className="font-extrabold text-brand-text flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: status.color }}></div>
                      {status.name}
                    </h4>
                    <span className="text-xs bg-white/60 text-brand-text px-2.5 py-1 rounded-full font-bold shadow-sm">{items.length}</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 min-h-[100px] pr-1 pb-1 custom-scrollbar">
                    {items.map(item => {
                      const { points, cleanTitle } = parseStoryPoints(item.title);
                      return (
                        <div 
                          key={item.id} 
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("itemId", item.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onClick={() => setSelectedTask(item)}
                          className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white hover:border-brand-orange/40 hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing hover:-translate-y-1"
                        >
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <span className="font-bold text-brand-text text-sm leading-snug flex flex-wrap items-center gap-1.5">
                              {points && (
                                <span className="bg-brand-orange/15 text-brand-orange text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm shrink-0 uppercase tracking-wider border border-brand-orange/10">
                                  {points} pts
                                </span>
                              )}
                              <span>{cleanTitle}</span>
                            </span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteWorkItem(item.id); }} 
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white rounded-full p-1 shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          
                          {item.description && (
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {renderTaskLabels(item.labels)}

                          {item.dueDate && (
                            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold mb-3">
                              <Clock size={11} className="text-brand-orange" />
                              <span>Batas: {new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-between items-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${getPriorityColor(item.priority)} flex items-center gap-1 shadow-sm`}>
                              {item.priority === 'Mendesak' && <Flag size={10} />}
                              {item.priority}
                            </span>
                            
                            <select 
                              className="text-xs bg-white/60 border border-white rounded-full px-2 py-1 text-gray-600 hover:text-brand-text cursor-pointer outline-none focus:ring-2 focus:ring-brand-orange/30 font-semibold shadow-sm"
                              value={item.statusId || ""}
                              onChange={(e) => updateWorkItemStatus(item.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {workspaceData.statuses.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => { setNewTaskStatusId(status.id); setShowNewTaskModal(true); }}
                    className="mt-4 w-full py-3 bg-white/40 hover:bg-white/80 border border-white hover:border-white rounded-xl text-gray-600 hover:text-brand-text text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus size={16} /> Tambah Tugas
                  </button>
                </div>
              );
            })}
            
            {/* Interactive Add Status Column Form */}
            <div className="w-[320px] shrink-0">
              {showAddColumnForm ? (
                <form onSubmit={createStatus} className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white shadow-md space-y-4">
                  <h4 className="font-bold text-brand-text text-sm">Tambah Kolom Baru</h4>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Kolom</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: QA, Review..." 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Warna Penanda</label>
                    <div className="flex gap-2">
                      {['#64748b', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewColumnColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${newColumnColor === c ? 'scale-125 border-gray-400' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button 
                      type="button" 
                      onClick={() => setShowAddColumnForm(false)}
                      className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-brand-text rounded-lg shadow"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setShowAddColumnForm(true)}
                  className="w-full py-4 bg-white/30 hover:bg-white/60 backdrop-blur-md border-2 border-dashed border-white/60 hover:border-white rounded-3xl text-gray-500 hover:text-brand-text text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                   <Plus size={16} /> Tambah Kolom
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB SCRUM */}
        {activeTab === 'scrum' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/60 backdrop-blur-md border border-white rounded-3xl shadow-sm overflow-hidden mb-6">
              <div className="bg-white/40 px-8 py-6 border-b border-white/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-brand-orange/20 text-brand-orange text-[10px] font-bold uppercase rounded tracking-wider">Jira Sprint Board</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                      <Star size={12} /> Total Points: {calculateTotalPoints()} pts
                    </span>
                  </div>
                  <h3 className="font-extrabold text-2xl text-brand-text flex items-center gap-2">
                    {sprintName}
                    <button onClick={handleOpenSprintModal} className="text-gray-400 hover:text-brand-text transition-colors p-1 bg-white/55 rounded-md border border-gray-100">
                      <Edit2 size={14} />
                    </button>
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">{sprintDates}</p>
                  {sprintGoal && (
                    <p className="text-xs text-gray-400 italic mt-1 font-medium bg-white/30 px-3 py-1 rounded-lg inline-block">
                      Sasaran: {sprintGoal}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => alert(`Sprint ini (${sprintName}) berhasil diselesaikan dengan total ${calculateTotalPoints()} story points!`)} 
                  className="px-5 py-2.5 bg-brand-text hover:bg-black text-white rounded-full text-xs font-extrabold shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  Selesaikan Sprint
                </button>
              </div>

              {/* Dynamic Sprint Columns */}
              <div className="p-6 overflow-x-auto">
                <div className="flex gap-4 min-w-[800px] items-start">
                  {workspaceData.statuses.map((status, idx) => {
                    const items = workspaceData.workItems.filter(i => i.statusId === status.id);
                    const borderColors = ['border-l-blue-400', 'border-l-yellow-400', 'border-l-purple-400', 'border-l-green-400', 'border-l-gray-400'];
                    const borderClass = borderColors[idx % borderColors.length];

                    return (
                      <div 
                        key={status.id} 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const itemId = e.dataTransfer.getData("itemId");
                          if (itemId) updateWorkItemStatus(itemId, status.id);
                        }}
                        className="flex-1 bg-white/40 rounded-2xl p-4 border border-white/60 shadow-sm backdrop-blur-sm min-h-[350px] flex flex-col"
                      >
                        <h4 className="font-bold text-gray-700 text-sm mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }}></span>
                            {status.name}
                          </span>
                          <span className="bg-white/60 text-brand-text px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                            {items.length}
                          </span>
                        </h4>
                        
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                          {items.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-200/50 rounded-xl h-24 flex items-center justify-center text-gray-400 text-[11px] italic">
                              Tarik tugas ke sini
                            </div>
                          ) : (
                            items.map(item => {
                              const { points, cleanTitle } = parseStoryPoints(item.title);
                              return (
                                <div 
                                  key={item.id} 
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("itemId", item.id);
                                    e.dataTransfer.effectAllowed = "move";
                                  }}
                                  onClick={() => setSelectedTask(item)}
                                  className={`bg-white/95 hover:bg-white p-4 rounded-xl shadow-sm border border-white border-l-4 ${borderClass} text-sm font-medium hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:-translate-y-0.5`}
                                >
                                  <div className="text-brand-text font-bold leading-snug">{cleanTitle}</div>
                                  
                                  {item.description && (
                                    <div className="text-[11px] text-gray-400 font-medium line-clamp-1 mt-1">{item.description}</div>
                                  )}

                                  {renderTaskLabels(item.labels)}

                                  {item.subtasks && (() => {
                                    try {
                                      const subs = JSON.parse(item.subtasks);
                                      if (Array.isArray(subs) && subs.length > 0) {
                                        const doneCount = subs.filter((s: any) => s.done).length;
                                        return (
                                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mt-1.5 bg-gray-50/50 px-2 py-0.5 rounded border border-gray-100/50 w-fit">
                                            <CheckSquare size={10} className="text-brand-orange" />
                                            <span>{doneCount}/{subs.length} Subtugas</span>
                                          </div>
                                        );
                                      }
                                    } catch (e) {}
                                    return null;
                                  })()}

                                  <div className="mt-3 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${getPriorityColor(item.priority)}`}>
                                      {item.priority}
                                    </span>
                                    {points ? (
                                      <span className="bg-brand-orange/15 text-brand-orange px-2 py-0.5 rounded font-extrabold border border-brand-orange/10">
                                        {points} pts
                                      </span>
                                    ) : (
                                      <span className="text-gray-300">0 pts</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB WATERFALL */}
        {activeTab === 'waterfall' && (() => {
          // Calculate timeline boundaries from real data
          const allDates: Date[] = [];
          workspaceData.workItems.forEach(item => {
            allDates.push(new Date(item.createdAt));
            if (item.dueDate) allDates.push(new Date(item.dueDate));
          });
          
          const now = new Date();
          if (allDates.length === 0) allDates.push(now);
          
          const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...allDates.map(d => d.getTime()), now.getTime() + 30 * 24 * 60 * 60 * 1000));
          // Add padding
          minDate.setDate(minDate.getDate() - 7);
          maxDate.setDate(maxDate.getDate() + 14);
          const totalRange = maxDate.getTime() - minDate.getTime();

          // Generate month markers for the timeline
          const monthMarkers: { label: string; leftPct: number; widthPct: number }[] = [];
          const startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
          while (startMonth <= maxDate) {
            const monthStart = Math.max(startMonth.getTime(), minDate.getTime());
            const nextMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 1);
            const monthEnd = Math.min(nextMonth.getTime(), maxDate.getTime());
            monthMarkers.push({
              label: startMonth.toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
              leftPct: ((monthStart - minDate.getTime()) / totalRange) * 100,
              widthPct: ((monthEnd - monthStart) / totalRange) * 100,
            });
            startMonth.setMonth(startMonth.getMonth() + 1);
          }

          // Today marker position
          const todayPct = ((now.getTime() - minDate.getTime()) / totalRange) * 100;

          const phaseColors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#ec4899'];

          return (
            <div className="max-w-6xl mx-auto bg-white/60 backdrop-blur-md border border-white rounded-3xl shadow-sm p-6 md:p-8 overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-brand-text text-lg">Diagram Gantt — Alur Waterfall</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <span className="w-3 h-0.5 bg-red-400 inline-block"></span> Hari ini
                </div>
              </div>
              <div className="min-w-[700px]">
                {/* Timeline Header */}
                <div className="flex border-b-2 border-gray-200 pb-2 mb-2">
                  <div className="w-1/4 shrink-0 font-extrabold text-xs text-gray-500 uppercase tracking-wider">Fase / Status</div>
                  <div className="w-3/4 flex relative">
                    {monthMarkers.map((m, i) => (
                      <div 
                        key={i} 
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-l border-gray-200 pl-2 overflow-hidden" 
                        style={{ position: 'absolute', left: `${m.leftPct}%`, width: `${m.widthPct}%` }}
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Phase Rows = Status Columns */}
                {workspaceData.statuses.map((status, statusIdx) => {
                  const phaseItems = workspaceData.workItems.filter(i => i.statusId === status.id);
                  const color = phaseColors[statusIdx % phaseColors.length];

                  return (
                    <div key={status.id} className="mb-1">
                      {/* Phase header */}
                      <div className="flex items-center mb-1">
                        <div className="w-1/4 shrink-0 flex items-center gap-2 py-2">
                          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: status.color }}></span>
                          <span className="text-sm font-bold text-brand-text">{status.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded-full">{phaseItems.length}</span>
                        </div>
                        <div className="w-3/4 relative h-1">
                          {/* Today line */}
                          {todayPct >= 0 && todayPct <= 100 && (
                            <div className="absolute top-[-20px] bottom-[-20px] w-0.5 bg-red-400 z-10" style={{ left: `${todayPct}%` }}></div>
                          )}
                        </div>
                      </div>

                      {/* Task bars */}
                      {phaseItems.length === 0 ? (
                        <div className="flex items-center mb-3">
                          <div className="w-1/4 shrink-0"></div>
                          <div className="w-3/4 relative h-8 bg-gray-50/50 rounded-lg border border-gray-100/50">
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-300 italic font-medium">Belum ada tugas</span>
                          </div>
                        </div>
                      ) : (
                        phaseItems.map(item => {
                          const created = new Date(item.createdAt);
                          const due = item.dueDate ? new Date(item.dueDate) : new Date(created.getTime() + 14 * 24 * 60 * 60 * 1000); // Default 2 weeks
                          const startPct = Math.max(0, ((created.getTime() - minDate.getTime()) / totalRange) * 100);
                          const endPct = Math.min(100, ((due.getTime() - minDate.getTime()) / totalRange) * 100);
                          const widthPct = Math.max(3, endPct - startPct); // Min 3% width for visibility

                          return (
                            <div key={item.id} className="flex items-center mb-1.5">
                              <div className="w-1/4 shrink-0 pl-5">
                                <span className="text-xs text-gray-500 font-medium truncate block max-w-full">{item.title}</span>
                              </div>
                              <div className="w-3/4 relative h-8 bg-gray-50/30 rounded-lg">
                                <div 
                                  onClick={() => setSelectedTask(item)}
                                  className="absolute top-1 bottom-1 rounded-lg text-white text-[10px] flex items-center px-2.5 font-bold shadow-sm cursor-pointer hover:brightness-110 transition-all hover:scale-y-110 origin-center"
                                  style={{ left: `${startPct}%`, width: `${widthPct}%`, backgroundColor: color, maxWidth: `${100 - startPct}%` }}
                                >
                                  <span className="truncate">{item.title}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* TAB DAFTAR */}
        {activeTab === 'list' && (
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-3xl shadow-sm overflow-hidden max-w-6xl mx-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-white/40 backdrop-blur-md border-b border-white/60">
                 <tr>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Tugas</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioritas</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Batas Waktu</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-100">
                 {workspaceData.workItems.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada tugas ditemukan. Coba tambahkan dari Tampilan Papan.</td></tr>
                 ) : (
                   workspaceData.workItems.map(item => {
                     const { points, cleanTitle } = parseStoryPoints(item.title);
                     return (
                       <tr 
                         key={item.id} 
                         onClick={() => setSelectedTask(item)}
                         className="hover:bg-white/60 transition-colors group cursor-pointer"
                       >
                         <td className="px-6 py-4 text-sm font-medium text-brand-text">
                           <div className="flex items-center gap-2">
                             {points && (
                               <span className="bg-brand-orange/15 text-brand-orange text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0">
                                 {points} pts
                               </span>
                             )}
                             <span>{cleanTitle}</span>
                           </div>
                           {item.description && <div className="text-xs text-gray-400 mt-1 font-normal line-clamp-1">{item.description}</div>}
                            {renderTaskLabels(item.labels)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <select 
                               className="text-xs bg-white/60 border border-white rounded-full px-3 py-1.5 text-gray-700 shadow-sm font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-brand-orange"
                               value={item.statusId || ""}
                               onChange={(e) => updateWorkItemStatus(item.id, e.target.value)}
                               onClick={(e) => e.stopPropagation()}
                             >
                               {workspaceData.statuses.map(s => (
                                 <option key={s.id} value={s.id}>{s.name}</option>
                               ))}
                             </select>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                             {item.priority}
                           </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                           {item.dueDate ? (
                             <span className="flex items-center gap-1.5">
                               <Clock size={14} className="text-brand-orange" />
                               {new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                             </span>
                           ) : (
                             <span className="text-gray-300">-</span>
                           )}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={(e) => { e.stopPropagation(); deleteWorkItem(item.id); }} 
                             className="text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                           >
                             Hapus
                           </button>
                         </td>
                       </tr>
                     );
                   })
                 )}
               </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH TUGAS BARU */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={createWorkItem} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-2xl font-extrabold text-brand-text">Buat Tugas Baru</h3>
              <button type="button" onClick={() => setShowNewTaskModal(false)} className="text-gray-400 hover:text-brand-text">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Judul Tugas</label>
                <input 
                  type="text" 
                  placeholder="Apa yang perlu dikerjakan?" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all font-semibold"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deskripsi Tugas</label>
                <textarea 
                  placeholder="Beri detail tugas..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all leading-relaxed"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prioritas</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all font-bold"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Mendesak">Mendesak</option>
                </select>
              </div>

              {/* Custom Colored Labels for New Task */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label Kustom</label>
                <div className="flex flex-wrap gap-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200 min-h-[44px]">
                  {newTaskLabels.length === 0 ? (
                    <span className="text-xs text-gray-400 font-semibold p-1">Belum ada label. Tambahkan di bawah.</span>
                  ) : (
                    newTaskLabels.map((lbl, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1 shadow-sm"
                        style={{ backgroundColor: lbl.color }}
                      >
                        {lbl.name}
                        <button 
                          type="button" 
                          onClick={() => setNewTaskLabels(newTaskLabels.filter((_, i) => i !== idx))}
                          className="hover:bg-black/20 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold text-[8px] cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nama label baru..." 
                    value={newTLabelName}
                    onChange={(e) => setNewTLabelName(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  <input 
                    type="color" 
                    value={newTLabelColor}
                    onChange={(e) => setNewTLabelColor(e.target.value)}
                    className="w-8 h-8 p-0 bg-transparent border-0 rounded-lg cursor-pointer shrink-0"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (newTLabelName.trim()) {
                        setNewTaskLabels([...newTaskLabels, { name: newTLabelName.trim(), color: newTLabelColor }]);
                        setNewTLabelName("");
                      }
                    }}
                    className="px-3 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-brand-text hover:bg-black rounded-full shadow-md transition-colors"
              >
                Buat Tugas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: SPRINT SETTINGS */}
      {showSprintModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveSprint} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-brand-text">Atur Sprint Aktif</h3>
              <button type="button" onClick={() => setShowSprintModal(false)} className="text-gray-400 hover:text-brand-text">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Sprint</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange font-bold"
                  value={tempSprintName}
                  onChange={(e) => setTempSprintName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal & Durasi</label>
                <input 
                  type="text" 
                  placeholder="Contoh: 12 Jul - 26 Jul • 2 Minggu"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange font-semibold"
                  value={tempSprintDates}
                  onChange={(e) => setTempSprintDates(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tujuan Sprint (Goal)</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange leading-relaxed"
                  value={tempSprintGoal}
                  onChange={(e) => setTempSprintGoal(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setShowSprintModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-brand-text hover:bg-black rounded-full shadow-md transition-colors"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PREMIUM INTERACTIVE DETAILS MODAL (CARD BACK) */}
      {selectedTask && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={updateWorkItemDetails} className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Left side: Main task info */}
            <div className="flex-1 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <CheckSquare size={14} className="text-brand-orange" />
                  <span>Detail Tugas JIRA / TRELLO</span>
                </div>
                <input 
                  type="text" 
                  className="w-full bg-transparent text-2xl font-extrabold text-brand-text border-b border-transparent hover:border-gray-200 focus:border-brand-orange py-1 outline-none transition-all"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Deskripsi Lengkap</label>
                <textarea 
                  placeholder="Beri detail tugas secara mendalam, kriteria penerimaan, dll..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm h-48 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all leading-relaxed"
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                />
              </div>

              {/* Checklist Subtugas */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider">Subtugas / Checklist</label>
                  {editTaskSubtasks.length > 0 && (
                    <span className="text-[10px] bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full font-bold">
                      {editTaskSubtasks.filter(s => s.done).length} dari {editTaskSubtasks.length} Selesai ({Math.round((editTaskSubtasks.filter(s => s.done).length / editTaskSubtasks.length) * 100)}%)
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {editTaskSubtasks.length > 0 && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-brand-orange h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(editTaskSubtasks.filter(s => s.done).length / editTaskSubtasks.length) * 100}%` }}
                    />
                  </div>
                )}

                <div className="bg-gray-50/70 p-4 rounded-2xl space-y-2.5 border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar">
                  {editTaskSubtasks.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-4 font-medium">Belum ada subtugas. Pecah tugas ini menjadi bagian kecil!</div>
                  ) : (
                    editTaskSubtasks.map((sub, idx) => (
                      <div key={sub.id || idx} className="flex items-center justify-between gap-2 group/sub">
                        <label className="flex items-center gap-2.5 text-xs font-bold text-gray-600 cursor-pointer hover:text-brand-text flex-1">
                          <input 
                            type="checkbox" 
                            checked={sub.done} 
                            onChange={(e) => {
                              const updated = [...editTaskSubtasks];
                              updated[idx].done = e.target.checked;
                              setEditTaskSubtasks(updated);
                            }}
                            className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange border-gray-300 cursor-pointer" 
                          />
                          <span className={sub.done ? "line-through text-gray-400 font-normal" : ""}>{sub.title}</span>
                        </label>
                        <button 
                          type="button"
                          onClick={() => {
                            setEditTaskSubtasks(editTaskSubtasks.filter((_, i) => i !== idx));
                          }}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-opacity p-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Tambah Subtugas Form */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Tambah subtugas baru..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSubtaskTitle.trim()) {
                          const newItem = { id: Math.random().toString(36).substring(2, 9), title: newSubtaskTitle.trim(), done: false };
                          setEditTaskSubtasks([...editTaskSubtasks, newItem]);
                          setNewSubtaskTitle("");
                        }
                      }
                    }}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubtaskTitle.trim()) {
                        const newItem = { id: Math.random().toString(36).substring(2, 9), title: newSubtaskTitle.trim(), done: false };
                        setEditTaskSubtasks([...editTaskSubtasks, newItem]);
                        setNewSubtaskTitle("");
                      }
                    }}
                    className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl hover:bg-brand-orange/95 cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Activity Feed / Riwayat Aktivitas */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider">Riwayat Aktivitas & Akuntabilitas</label>
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 max-h-52 overflow-y-auto custom-scrollbar space-y-3">
                  {!selectedTask.activities ? (
                    <div className="text-xs text-gray-400 text-center py-4 font-medium">Belum ada riwayat aktivitas.</div>
                  ) : (() => {
                    try {
                      const logs = JSON.parse(selectedTask.activities);
                      if (!Array.isArray(logs) || logs.length === 0) {
                        return <div className="text-xs text-gray-400 text-center py-4 font-medium">Belum ada riwayat aktivitas.</div>;
                      }
                      return logs.slice().reverse().map((log: { timestamp: string, text: string }, idx: number) => (
                        <div key={idx} className="flex gap-2.5 text-xs text-gray-600">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5" />
                            {idx < logs.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 my-1" />}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-brand-text leading-snug">{log.text}</p>
                            <span className="text-[10px] text-gray-400 font-bold block">{formatActivityDate(log.timestamp)}</span>
                          </div>
                        </div>
                      ));
                    } catch (e) {
                      return <div className="text-xs text-gray-400 text-center py-4 font-medium">Gagal memuat riwayat aktivitas.</div>;
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Right side: Meta settings pane */}
            <div className="w-full md:w-60 bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4 shrink-0 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">Pengaturan Tugas</h4>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status Alur Kerja</label>
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    value={editTaskStatusId}
                    onChange={(e) => setEditTaskStatusId(e.target.value)}
                  >
                    {workspaceData.statuses.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Skala Prioritas</label>
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange font-bold"
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value)}
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Mendesak">Mendesak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Poin Cerita (Story Points)</label>
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange text-brand-orange"
                    value={editTaskStoryPoints}
                    onChange={(e) => setEditTaskStoryPoints(e.target.value)}
                  >
                    <option value="0">0 pts (Tanpa Point)</option>
                    <option value="1">1 pt</option>
                    <option value="2">2 pts</option>
                    <option value="3">3 pts</option>
                    <option value="5">5 pts</option>
                    <option value="8">8 pts</option>
                    <option value="13">13 pts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Batas Jatuh Tempo</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange font-semibold text-gray-700"
                      value={editTaskDueDate}
                      onChange={(e) => setEditTaskDueDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Labels Management for Edit Task */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Label Kustom</label>
                  <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-xl p-2 min-h-[38px]">
                    {editTaskLabels.length === 0 ? (
                      <span className="text-[10px] text-gray-400 font-semibold">Belum ada label.</span>
                    ) : (
                      editTaskLabels.map((lbl, idx) => (
                        <span 
                          key={idx} 
                          className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white flex items-center gap-1 shadow-xs"
                          style={{ backgroundColor: lbl.color }}
                        >
                          {lbl.name}
                          <button 
                            type="button" 
                            onClick={() => setEditTaskLabels(editTaskLabels.filter((_, i) => i !== idx))}
                            className="hover:bg-black/20 rounded-full w-3 h-3 flex items-center justify-center font-bold text-[7px] cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      placeholder="Nama label..." 
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                    <div className="flex gap-1 items-center">
                      <input 
                        type="color" 
                        value={newLabelColor}
                        onChange={(e) => setNewLabelColor(e.target.value)}
                        className="w-6 h-6 p-0 bg-transparent border-0 rounded cursor-pointer shrink-0"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (newLabelName.trim()) {
                            setEditTaskLabels([...editTaskLabels, { name: newLabelName.trim(), color: newLabelColor }]);
                            setNewLabelName("");
                          }
                        }}
                        className="flex-1 py-1 bg-brand-orange hover:bg-brand-orange/95 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-brand-text hover:bg-black text-white rounded-xl text-xs font-extrabold shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
                <button 
                  type="button"
                  onClick={() => deleteWorkItem(selectedTask.id)}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 border border-red-100 cursor-pointer"
                >
                  <Trash2 size={13} /> Hapus Tugas
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="w-full py-2.5 bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
