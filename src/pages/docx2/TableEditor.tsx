import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ColumnDefinition, TableDefinition } from './types';

interface Props {
  table: TableDefinition;
  onChange: (updated: TableDefinition) => void;
  onRemove: () => void;
}

const mono: React.CSSProperties = { fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' };

const DangerButton = ({
  onClick,
  children,
  title,
  inline,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  inline?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: 'none',
      border: inline ? 'none' : '1px solid #e5e7eb',
      borderRadius: inline ? '0' : '6px',
      cursor: 'pointer',
      color: '#9ca3af',
      fontSize: inline ? '16px' : '12px',
      padding: inline ? '0 2px' : '4px 10px',
      lineHeight: inline ? 1 : undefined,
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget;
      el.style.color = '#ef4444';
      if (!inline) el.style.borderColor = '#ef4444';
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget;
      el.style.color = '#9ca3af';
      if (!inline) el.style.borderColor = '#e5e7eb';
    }}
  >
    {children}
  </button>
);

const TableEditor = ({ table, onChange, onRemove }: Props) => {
  const [newColKey, setNewColKey] = useState('');
  const [newColLabel, setNewColLabel] = useState('');

  const addColumn = () => {
    const key = newColKey.trim();
    const label = newColLabel.trim();
    if (!key || !label) return;
    if (table.columns.some((c) => c.key === key)) {
      alert(`Column with key "${key}" already exists.`);
      return;
    }
    const col: ColumnDefinition = { id: crypto.randomUUID(), key, label };
    onChange({
      ...table,
      columns: [...table.columns, col],
      rows: table.rows.map((r) => ({ ...r, [key]: '' })),
    });
    setNewColKey('');
    setNewColLabel('');
  };

  const removeColumn = (colId: string) => {
    const col = table.columns.find((c) => c.id === colId);
    if (!col) return;
    onChange({
      ...table,
      columns: table.columns.filter((c) => c.id !== colId),
      rows: table.rows.map((r) => {
        const copy = { ...r };
        delete copy[col.key];
        return copy;
      }),
    });
  };

  const addRow = () => {
    const emptyRow = Object.fromEntries(table.columns.map((c) => [c.key, '']));
    onChange({ ...table, rows: [...table.rows, emptyRow] });
  };

  const removeRow = (idx: number) =>
    onChange({ ...table, rows: table.rows.filter((_, i) => i !== idx) });

  const updateCell = (rowIdx: number, colKey: string, value: string) =>
    onChange({
      ...table,
      rows: table.rows.map((r, i) => (i === rowIdx ? { ...r, [colKey]: value } : r)),
    });

  return (
    <div
      style={{
        background: '#efefef',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px 24px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{table.label}</span>{' '}
          <span style={mono}>{`{FOR item IN ${table.varName}}`}</span>
        </div>
        <DangerButton onClick={onRemove}>Remove table</DangerButton>
      </div>

      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>
        Columns — each becomes <span style={mono}>{`{$item.key}`}</span> inside the loop
      </p>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <label
            style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}
          >
            Column key
          </label>
          <Input
            placeholder="e.g. price"
            value={newColKey}
            onChange={(e) => setNewColKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addColumn()}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '3px' }}
          >
            Column label
          </label>
          <Input
            placeholder="e.g. Price"
            value={newColLabel}
            onChange={(e) => setNewColLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addColumn()}
          />
        </div>
        <Button
          onClick={addColumn}
          disabled={!newColKey.trim() || !newColLabel.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          + Add column
        </Button>
      </div>

      {table.columns.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {table.columns.map((col) => (
              <div
                key={col.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: '#111827' }}>{col.label}</span>
                <span style={{ ...mono, marginLeft: '2px' }}>{`{$item.${col.key}}`}</span>
                <DangerButton onClick={() => removeColumn(col.id)} title="Remove column" inline>
                  ×
                </DangerButton>
              </div>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '10px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  {table.columns.map((col) => (
                    <th
                      key={col.id}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: 600,
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th style={{ width: '40px' }} />
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    style={{
                      borderBottom: rowIdx < table.rows.length - 1 ? '1px solid #f3f4f6' : 'none',
                      background: '#fff',
                    }}
                  >
                    {table.columns.map((col) => (
                      <td key={col.id} style={{ padding: '6px 8px' }}>
                        <Input
                          value={row[col.key] ?? ''}
                          onChange={(e) => updateCell(rowIdx, col.key, e.target.value)}
                          style={{ height: '32px', fontSize: '13px' }}
                        />
                      </td>
                    ))}
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <DangerButton onClick={() => removeRow(rowIdx)} title="Remove row" inline>
                        ×
                      </DangerButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button variant="outline" onClick={addRow} style={{ fontSize: '13px' }}>
            + Add row
          </Button>
        </>
      )}
    </div>
  );
};

export default TableEditor;
