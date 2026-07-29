import React from 'react';
import { AppUser, CustomFieldDef } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { tr, parseFieldOptions, FilterState, EMPTY_FILTERS, countActiveFilters } from './utils';
import { SlidersHorizontal, Diamond, Lock, RotateCcw, ArrowDownWideNarrow, Group } from 'lucide-react';

interface Props {
  users: AppUser[];
  fields: CustomFieldDef[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
  totalCount: number;
  visibleCount: number;
  showGrouping?: boolean;
}

const selectClass =
  'bg-white/80 dark:bg-gray-900/80 border border-white dark:border-gray-700 rounded-full px-3 py-1.5 text-[11px] font-bold text-brand-text dark:text-gray-100 shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-brand-orange max-w-[170px]';

export function TaskFilterBar({ users, fields, filters, onChange, totalCount, visibleCount, showGrouping }: Props) {
  const { t } = useLanguage();
  const active = countActiveFilters(filters);

  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const setField = (id: string, value: string) =>
    onChange({ ...filters, fieldValues: { ...filters.fieldValues, [id]: value } });

  const toggleClass = (on: boolean) =>
    `px-3 py-1.5 rounded-full text-[11px] font-extrabold border-2 border-b-4 transition-all active:translate-y-[2px] active:border-b-2 cursor-pointer flex items-center gap-1.5 shadow-sm ${
      on
        ? 'bg-brand-orange text-white border-brand-orange/60'
        : 'bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 border-white dark:border-gray-700 hover:text-brand-text dark:hover:text-white'
    }`;

  const filterableFields = fields.filter(f => f.type === 'select' || f.type === 'checkbox');

  return (
    <div className="mb-6 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md border border-white dark:border-gray-700 rounded-3xl p-3 sm:p-4 shadow-sm animate-in fade-in">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest pr-1">
          <SlidersHorizontal size={13} className="text-brand-orange" />
          {tr(t, 'wsFilter', 'Saring')}
        </span>

        {/* Assignee */}
        <select
          value={filters.assigneeId}
          onChange={(e) => set({ assigneeId: e.target.value })}
          className={selectClass}
          title={tr(t, 'wsAssignee', 'Penanggung Jawab')}
        >
          <option value="">{tr(t, 'wsAllAssignees', 'Semua PJ')}</option>
          <option value="none">{tr(t, 'wsNoAssignee', 'Tanpa penanggung jawab')}</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => set({ priority: e.target.value })}
          className={selectClass}
          title={tr(t, 'wsPriority', 'Prioritas')}
        >
          <option value="">{tr(t, 'wsAllPriorities', 'Semua prioritas')}</option>
          <option value="Mendesak">{tr(t, 'wsPriorityUrgent', 'Mendesak')}</option>
          <option value="Tinggi">{tr(t, 'wsPriorityHigh', 'Tinggi')}</option>
          <option value="Sedang">{tr(t, 'wsPriorityMedium', 'Sedang')}</option>
          <option value="Rendah">{tr(t, 'wsPriorityLow', 'Rendah')}</option>
        </select>

        {/* Milestone only */}
        <button
          type="button"
          onClick={() => set({ milestoneOnly: !filters.milestoneOnly })}
          className={toggleClass(filters.milestoneOnly)}
        >
          <Diamond size={11} /> {tr(t, 'wsMilestoneOnly', 'Milestone saja')}
        </button>

        {/* Has blockers */}
        <button
          type="button"
          onClick={() => set({ blockedOnly: !filters.blockedOnly })}
          className={toggleClass(filters.blockedOnly)}
        >
          <Lock size={11} /> {tr(t, 'wsHasBlockers', 'Punya blocker')}
        </button>

        {/* Custom field filters */}
        {filterableFields.map(field => (
          <select
            key={field.id}
            value={filters.fieldValues[field.id] || ''}
            onChange={(e) => setField(field.id, e.target.value)}
            className={selectClass}
            title={field.name}
          >
            <option value="">{field.name}: {tr(t, 'wsAll', 'semua')}</option>
            {field.type === 'checkbox' ? (
              [
                <option key="c" value="__checked__">{field.name}: {tr(t, 'wsChecked', 'tercentang')}</option>,
                <option key="u" value="__unchecked__">{field.name}: {tr(t, 'wsUnchecked', 'belum')}</option>,
              ]
            ) : (
              parseFieldOptions(field.options).map(opt => (
                <option key={opt} value={opt}>{field.name}: {opt}</option>
              ))
            )}
          </select>
        ))}

        <span className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Sort */}
        <label className="flex items-center gap-1.5">
          <ArrowDownWideNarrow size={13} className="text-gray-400" />
          <select
            value={filters.sort}
            onChange={(e) => set({ sort: e.target.value as FilterState['sort'] })}
            className={selectClass}
            title={tr(t, 'wsSort', 'Urutkan')}
          >
            <option value="none">{tr(t, 'wsSortDefault', 'Urutan asli')}</option>
            <option value="dueDate">{tr(t, 'wsSortDue', 'Batas waktu')}</option>
            <option value="priority">{tr(t, 'wsSortPriority', 'Prioritas')}</option>
            <option value="title">{tr(t, 'wsSortTitle', 'Judul A-Z')}</option>
            <option value="newest">{tr(t, 'wsSortNewest', 'Terbaru')}</option>
          </select>
        </label>

        {/* Group (kanban only) */}
        {showGrouping && (
          <label className="flex items-center gap-1.5">
            <Group size={13} className="text-gray-400" />
            <select
              value={filters.group}
              onChange={(e) => set({ group: e.target.value })}
              className={selectClass}
              title={tr(t, 'wsGroupBy', 'Kelompokkan')}
            >
              <option value="status">{tr(t, 'wsGroupStatus', 'Per status')}</option>
              <option value="assignee">{tr(t, 'wsGroupAssignee', 'Per penanggung jawab')}</option>
              {fields.filter(f => f.type === 'select').map(f => (
                <option key={f.id} value={`field:${f.id}`}>{tr(t, 'wsGroupPer', 'Per')} {f.name}</option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {visibleCount}/{totalCount} {tr(t, 'wsTasksShort', 'tugas')}
          </span>
          {active > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...EMPTY_FILTERS, fieldValues: {} })}
              className="px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-brand-orange/15 text-brand-orange hover:bg-brand-orange hover:text-white border-2 border-b-4 border-brand-orange/20 transition-all active:translate-y-[2px] active:border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              title={tr(t, 'wsResetFilters', 'Atur ulang saringan')}
            >
              <RotateCcw size={11} /> {active} {tr(t, 'wsActive', 'aktif')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskFilterBar;
