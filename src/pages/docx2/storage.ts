import type { FieldDefinition, TableDefinition } from './types';

const FIELDS_KEY = 'docx2_fields';
const TABLES_KEY = 'docx2_tables';

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export const loadFields = (): FieldDefinition[] => loadFromStorage<FieldDefinition>(FIELDS_KEY);
export const saveFields = (fields: FieldDefinition[]) =>
  localStorage.setItem(FIELDS_KEY, JSON.stringify(fields));

export const loadTables = (): TableDefinition[] => loadFromStorage<TableDefinition>(TABLES_KEY);
export const saveTables = (tables: TableDefinition[]) =>
  localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
