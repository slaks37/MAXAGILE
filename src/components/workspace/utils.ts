import { Status, WorkItem, CustomFieldDef } from '../../types';

/** Fallback helper so a missing i18n key never leaks on screen. */
export function tr(t: (k: string) => string, key: string, fallback: string) {
  const v = t(key);
  return v === key ? fallback : v;
}

/** "Budi Santoso" -> "BS" ; "Budi" -> "BU" */
export function initialsOf(name: string): string {
  const clean = (name || '').trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Pick black or white text so an avatar stays readable on any user colour. */
export function readableTextOn(hex: string): string {
  const h = (hex || '#F3A733').replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.substring(0, 2), 16) || 0;
  const g = parseInt(full.substring(2, 4), 16) || 0;
  const b = parseInt(full.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#202939' : '#ffffff';
}

/** Story points live inside the title as a "(3) " prefix. */
export function parseStoryPoints(title: string) {
  const match = (title || '').match(/^\((\d+)\)\s*(.*)/);
  if (match) return { points: match[1], cleanTitle: match[2] };
  return { points: null as string | null, cleanTitle: title || '' };
}

/** WorkItem.customFields is a JSON object keyed by field id. */
export function parseCustomFieldValues(json?: string | null): Record<string, any> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
}

/** CustomFieldDef.options is a JSON string[] used by the "select" type. */
export function parseFieldOptions(options?: string | null): string[] {
  if (!options) return [];
  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed.filter(o => typeof o === 'string') : [];
  } catch (e) {
    return [];
  }
}

const DONE_WORDS = /(selesai|beres|done|complete|completed|finish|finished|closed|tutup)/i;

/**
 * There is no explicit "done" flag on a work item, so a task counts as finished
 * when its status name reads like a done column, or when it sits in the very
 * last column of the board.
 */
export function isItemDone(item: WorkItem, statuses: Status[]): boolean {
  if (!item || !item.statusId) return false;
  const status = statuses.find(s => s.id === item.statusId);
  if (!status) return false;
  if (DONE_WORDS.test(status.name)) return true;
  if (statuses.length > 1) {
    const last = statuses[statuses.length - 1];
    if (last && last.id === status.id) return true;
  }
  return false;
}

/** Ids of blockers that are not finished yet. */
export function unfinishedBlockers(item: WorkItem, allItems: WorkItem[], statuses: Status[]): string[] {
  const ids = Array.isArray(item?.blockedBy) ? item.blockedBy : [];
  if (ids.length === 0) return [];
  return ids.filter(id => {
    const blocker = allItems.find(i => i.id === id);
    if (!blocker) return false;
    return !isItemDone(blocker, statuses);
  });
}

export function formatFieldValue(def: CustomFieldDef, raw: any): string {
  if (raw === undefined || raw === null || raw === '') return '';
  if (def.type === 'checkbox') return raw ? '✓' : '';
  if (def.type === 'date') {
    try {
      return new Date(raw).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return String(raw);
    }
  }
  return String(raw);
}

export const PRIORITY_ORDER: Record<string, number> = {
  mendesak: 0,
  urgent: 0,
  tinggi: 1,
  high: 1,
  sedang: 2,
  medium: 2,
  rendah: 3,
  low: 3,
};

export function priorityRank(priority: string): number {
  const key = (priority || '').toLowerCase();
  return PRIORITY_ORDER[key] !== undefined ? PRIORITY_ORDER[key] : 4;
}

export type SortKey = 'none' | 'dueDate' | 'priority' | 'title' | 'newest';
export type GroupKey = string; // 'status' | 'assignee' | `field:<id>`

export interface FilterState {
  assigneeId: string;      // '' = all, 'none' = unassigned
  priority: string;        // '' = all
  milestoneOnly: boolean;
  blockedOnly: boolean;
  fieldValues: Record<string, string>; // custom field id -> value ('' = all)
  sort: SortKey;
  group: GroupKey;
}

export const EMPTY_FILTERS: FilterState = {
  assigneeId: '',
  priority: '',
  milestoneOnly: false,
  blockedOnly: false,
  fieldValues: {},
  sort: 'none',
  group: 'status',
};

export function countActiveFilters(f: FilterState): number {
  let n = 0;
  if (f.assigneeId) n++;
  if (f.priority) n++;
  if (f.milestoneOnly) n++;
  if (f.blockedOnly) n++;
  Object.keys(f.fieldValues || {}).forEach(k => {
    if (f.fieldValues[k]) n++;
  });
  if (f.sort && f.sort !== 'none') n++;
  if (f.group && f.group !== 'status') n++;
  return n;
}

/** One filtering + sorting pass shared by every tab, so all views agree. */
export function applyFilters(
  items: WorkItem[],
  filters: FilterState,
  statuses: Status[],
): WorkItem[] {
  const f = filters || EMPTY_FILTERS;
  let out = (items || []).filter(item => {
    if (f.assigneeId === 'none') {
      if (item.assigneeId) return false;
    } else if (f.assigneeId) {
      if (item.assigneeId !== f.assigneeId) return false;
    }
    if (f.priority && (item.priority || '') !== f.priority) return false;
    if (f.milestoneOnly && !item.isMilestone) return false;
    if (f.blockedOnly && unfinishedBlockers(item, items, statuses).length === 0) return false;

    const fieldKeys = Object.keys(f.fieldValues || {});
    if (fieldKeys.length > 0) {
      const values = parseCustomFieldValues(item.customFields);
      for (const key of fieldKeys) {
        const wanted = f.fieldValues[key];
        if (!wanted) continue;
        const actual = values[key];
        if (wanted === '__checked__') {
          if (!actual) return false;
        } else if (wanted === '__unchecked__') {
          if (actual) return false;
        } else if (String(actual === undefined || actual === null ? '' : actual) !== wanted) {
          return false;
        }
      }
    }
    return true;
  });

  if (f.sort && f.sort !== 'none') {
    out = out.slice().sort((a, b) => {
      switch (f.sort) {
        case 'dueDate': {
          const av = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bv = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          return av - bv;
        }
        case 'priority':
          return priorityRank(a.priority) - priorityRank(b.priority);
        case 'title':
          return parseStoryPoints(a.title).cleanTitle.localeCompare(
            parseStoryPoints(b.title).cleanTitle, 'id', { sensitivity: 'base' });
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }

  return out;
}
