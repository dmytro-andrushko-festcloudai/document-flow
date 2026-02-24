export interface FieldDefinition {
  id: string;
  key: string;
  label: string;
  value: string;
}

export interface ColumnDefinition {
  id: string;
  key: string;
  label: string;
}

export interface TableDefinition {
  id: string;
  varName: string;
  label: string;
  columns: ColumnDefinition[];
  rows: Record<string, string>[];
}

export interface DocxPreviewHandle {
  generate: (
    templateBuffer: Uint8Array,
    fields: FieldDefinition[],
    tables: TableDefinition[],
    silent?: boolean
  ) => Promise<Uint8Array | null>;
  renderRaw: (buffer: Uint8Array) => Promise<void>;
}
