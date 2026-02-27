import { useState, useCallback, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import invoiceUrl from '@/assets/INVOICE.docx?url';
import DocxPreview from './DocxPreview';
import TableEditor from './TableEditor';
import { loadFields, saveFields, loadTables, saveTables } from './storage';
import type { DocxPreviewHandle, FieldDefinition, TableDefinition } from './types';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const card: React.CSSProperties = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px 24px',
  marginBottom: '20px',
};

const cardTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '14px',
  color: '#111827',
  marginBottom: '16px',
};

// ---------------------------------------------------------------------------
// Field builder section
// ---------------------------------------------------------------------------
interface FieldBuilderProps {
  fields: FieldDefinition[];
  onAdd: (key: string, label: string, description: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<FieldDefinition, 'label' | 'description'>>) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const FieldBuilder = ({ fields, onAdd, onUpdate, onRemove, onClearAll }: FieldBuilderProps) => {
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    const k = key.trim();
    const l = label.trim();
    const d = description.trim();
    if (!k || !l) return;
    onAdd(k, l, d);
    setKey('');
    setLabel('');
    setDescription('');
  };

  return (
    <div style={card}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <p style={{ ...cardTitle, margin: 0 }}>Define template fields</p>
        {fields.length > 0 && (
          <button
            onClick={onClearAll}
            style={{
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#9ca3af',
              fontSize: '12px',
              padding: '4px 10px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            Clear all
          </button>
        )}
      </div>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
        Add fields that match the <b>{`{key}`}</b> placeholders in your DOCX template.
      </p>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label
            style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}
          >
            Key (matches <b>{`{key}`}</b> in template)
          </label>
          <Input
            placeholder="e.g. companyName"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}
          >
            Label (shown in form)
          </label>
          <Input
            placeholder="e.g. Company Name"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}
          >
            Description (optional)
          </label>
          <Input
            placeholder="e.g. Used in invoice header"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!key.trim() || !label.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          + Add field
        </Button>
      </div>

      {fields.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: 600,
            width: '25%',
                  }}
                >
                  Key
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: 600,
                  }}
                >
                  Label
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: 600,
                  }}
                >
                  Description
                </th>
                <th style={{ width: '40px' }} />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => (
                <tr
                  key={field.id}
                  style={{
                    borderBottom: idx < fields.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: '#fff',
                  }}
                >
                  <td
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      color: '#111827',
                    }}
                  >
                    {`{${field.key}}`}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '13px', color: '#374151' }}>
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        onUpdate(field.id, {
                          label: e.target.value,
                        })
                      }
                      style={{ height: '32px', fontSize: '13px' }}
                    />
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: '#6b7280',
                    }}
                  >
                    <Input
                      placeholder="No description"
                      value={field.description ?? ''}
                      onChange={(e) =>
                        onUpdate(field.id, {
                          description: e.target.value,
                        })
                      }
                      style={{ height: '32px', fontSize: '13px' }}
                    />
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <button
                      onClick={() => onRemove(field.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        fontSize: '16px',
                        lineHeight: 1,
                        padding: '2px 4px',
                        borderRadius: '4px',
                      }}
                      title="Remove field"
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#ef4444')}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#9ca3af')}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Fill values section
// ---------------------------------------------------------------------------
interface FillValuesProps {
  fields: FieldDefinition[];
  onUpdate: (id: string, value: string) => void;
}

const FillValues = ({ fields, onUpdate }: FillValuesProps) => (
  <div style={card}>
    <p style={cardTitle}>Fill in values</p>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}
    >
      {fields.map((field) => (
        <div key={field.id}>
          <label
            style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}
          >
            {field.label}{' '}
            <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px' }}>
              {`{${field.key}}`}
            </span>
          </label>
          <Input
            placeholder={`Enter ${field.label.toLowerCase()}`}
            value={field.value}
            onChange={(e) => onUpdate(field.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Table fields section
// ---------------------------------------------------------------------------
interface TableFieldsProps {
  tables: TableDefinition[];
  onAdd: (varName: string, label: string) => void;
  onUpdate: (id: string, updated: TableDefinition) => void;
  onRemove: (id: string) => void;
}

const TableFields = ({ tables, onAdd, onUpdate, onRemove }: TableFieldsProps) => {
  const [varName, setVarName] = useState('');
  const [label, setLabel] = useState('');

  const handleAdd = () => {
    const v = varName.trim();
    const l = label.trim();
    if (!v || !l) return;
    onAdd(v, l);
    setVarName('');
    setLabel('');
  };

  return (
    <div style={card}>
      <p style={{ ...cardTitle, marginBottom: '8px' }}>Define table fields</p>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
        Declare a list variable used in loops like{' '}
        <b style={{ fontFamily: 'monospace' }}>{`{FOR item IN products}`}</b> …{' '}
        <b style={{ fontFamily: 'monospace' }}>{`{END-FOR item}`}</b>. Inside the loop use{' '}
        <b style={{ fontFamily: 'monospace' }}>{`{$item.key}`}</b>.
      </p>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label
            style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}
          >
            Variable name (used in <b>{`{FOR item IN …}`}</b>)
          </label>
          <Input
            placeholder="e.g. products"
            value={varName}
            onChange={(e) => setVarName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}
          >
            Label (shown in form)
          </label>
          <Input
            placeholder="e.g. Products"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!varName.trim() || !label.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          + Add table
        </Button>
      </div>

      {tables.map((table) => (
        <TableEditor
          key={table.id}
          table={table}
          onChange={(updated) => onUpdate(table.id, updated)}
          onRemove={() => onRemove(table.id)}
        />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
const Docx2 = () => {
  const [fields, setFields] = useState<FieldDefinition[]>(loadFields);
  const [tables, setTables] = useState<TableDefinition[]>(loadTables);
  const [templateBuffer, setTemplateBuffer] = useState<Uint8Array | null>(null);
  const [generatedBuffer, setGeneratedBuffer] = useState<Uint8Array | null>(null);

  const previewRef = useRef<DocxPreviewHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveFields(fields);
  }, [fields]);
  useEffect(() => {
    saveTables(tables);
  }, [tables]);

  const scheduleGenerate = useCallback(
    (f: FieldDefinition[], t: TableDefinition[], buf: Uint8Array) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const result = await previewRef.current?.generate(buf, f, t, true);
        if (result) setGeneratedBuffer(result);
      }, 600);
    },
    []
  );

  useEffect(() => {
    if (!templateBuffer) return;
    scheduleGenerate(fields, tables, templateBuffer);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, tables, templateBuffer]);

  // Field handlers
  const addField = (key: string, label: string, description: string) => {
    if (fields.some((f) => f.key === key)) {
      alert(`Field with key "${key}" already exists.`);
      return;
    }
    setFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key, label, description, value: '' },
    ]);
  };
  const updateFieldMeta = (
    id: string,
    patch: Partial<Pick<FieldDefinition, 'label' | 'description'>>
  ) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id));
  const updateFieldValue = (id: string, value: string) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  const clearAllFields = () => {
    if (fields.length === 0) return;
    if (confirm('Clear all fields? This will also remove saved data.')) setFields([]);
  };

  // Table handlers
  const addTable = (varName: string, label: string) => {
    if (tables.some((t) => t.varName === varName)) {
      alert(`Table with variable name "${varName}" already exists.`);
      return;
    }
    setTables((prev) => [
      ...prev,
      { id: crypto.randomUUID(), varName, label, columns: [], rows: [] },
    ]);
  };
  const updateTable = (id: string, updated: TableDefinition) =>
    setTables((prev) => prev.map((t) => (t.id === id ? updated : t)));
  const removeTable = (id: string) => {
    if (confirm('Remove this table and all its data?'))
      setTables((prev) => prev.filter((t) => t.id !== id));
  };

  // File handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.name.endsWith('.docx')) {
      alert('Please select a valid .docx file.');
      return;
    }
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      setTemplateBuffer(buffer);
      setGeneratedBuffer(null);
      await previewRef.current?.renderRaw(buffer);
    } catch {
      alert('Error loading the document. Please check the file.');
    }
  };

  const downloadDocument = () => {
    if (!generatedBuffer) return;
    downloadBlob(
      new Blob([generatedBuffer as unknown as BlobPart], { type: DOCX_MIME }),
      'filled_document.docx'
    );
  };

  const downloadExample = () => {
    const a = document.createElement('a');
    a.href = invoiceUrl;
    a.download = 'INVOICE.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    if (fields.length > 0) {
      const fieldsData = fields.map((f) => ({
        Key: `{${f.key}}`,
        Label: f.label,
        Description: f.description ?? '',
        Value: f.value,
      }));
      const wsFields = XLSX.utils.json_to_sheet(fieldsData);
      XLSX.utils.book_append_sheet(wb, wsFields, 'Поля');
    }

    const tableColumnsData = tables.flatMap((table) =>
      table.columns.map((col) => ({
        'Таблиця': table.label,
        'Змінна': table.varName,
        'Ключ колонки': `{$item.${col.key}}`,
        'Лейбл': col.label,
        'Опис': col.description ?? '',
      }))
    );
    if (tableColumnsData.length > 0) {
      const wsTableColumns = XLSX.utils.json_to_sheet(tableColumnsData);
      XLSX.utils.book_append_sheet(wb, wsTableColumns, 'Поля таблиць');
    }

    tables.forEach((table) => {
      const headers = table.columns.map((c) => c.label);
      const rows = table.rows.map((row) =>
        table.columns.reduce<Record<string, string>>(
          (acc, col) => {
            acc[col.label] = row[col.key] ?? '';
            return acc;
          },
          {}
        )
      );
      const data = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ''))];
      const wsTable = XLSX.utils.aoa_to_sheet(data);
      const sheetName = table.label.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31) || table.varName;
      XLSX.utils.book_append_sheet(wb, wsTable, sheetName);
    });

    if (wb.SheetNames.length === 0) {
      const emptyWs = XLSX.utils.aoa_to_sheet([['Немає даних для експорту']]);
      XLSX.utils.book_append_sheet(wb, emptyWs, 'Дані');
    }

    XLSX.writeFile(wb, 'document-fields.xlsx');
  };

  return (
    <div className="field-builder-row">
      <div style={{ textAlign: 'left' }}>
        <h1 className="text-3xl font-medium mb-6">Templating for docx file with docx-templates</h1>

        <div style={card}>
          <p style={{ ...cardTitle, marginBottom: '8px' }}>
            docx file generated by{' '}
            <a
              href="https://www.npmjs.com/package/docx-templates"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <em>docx-templates</em>
            </a>{' '}
            package
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px' }}>
            Standard tags like <b>{`{firstName}`}</b> are replaced with the corresponding value.
          </p>
          <Button onClick={downloadExample} variant="outline" style={{ fontSize: '13px' }}>
            Download example DOCX template
          </Button>
        </div>

        <FieldBuilder
          fields={fields}
          onAdd={addField}
          onUpdate={updateFieldMeta}
          onRemove={removeField}
          onClearAll={clearAllFields}
        />

        {fields.length > 0 && <FillValues fields={fields} onUpdate={updateFieldValue} />}

        <TableFields
          tables={tables}
          onAdd={addTable}
          onUpdate={updateTable}
          onRemove={removeTable}
        />

        {(fields.length > 0 || tables.length > 0) && (
          <div style={card}>
            <p style={{ ...cardTitle, marginBottom: '8px' }}>Експорт даних</p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
              Вигрузити всі заповнені поля та таблиці в файл Excel.
            </p>
            <Button onClick={exportToExcel} variant="outline">
              Вигрузити в Excel
            </Button>
          </div>
        )}
      </div>

      <div style={{ ...card, background: '#fff', padding: '0', overflow: 'hidden', flex: 1 }}>
        <div style={card}>
          <input
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="docx-upload"
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={() => document.getElementById('docx-upload')?.click()}
              variant="outline"
            >
              Upload
            </Button>
            <Button onClick={downloadDocument} disabled={!generatedBuffer}>
              Download
            </Button>
          </div>
        </div>
        <DocxPreview ref={previewRef} />
      </div>
    </div>
  );
};

export default Docx2;
