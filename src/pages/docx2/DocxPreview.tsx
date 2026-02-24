import { useState, useCallback, useRef, memo, useImperativeHandle, forwardRef } from 'react';
import { createReport } from 'docx-templates';
import { renderAsync } from 'docx-preview';
import type { DocxPreviewHandle, FieldDefinition, TableDefinition } from './types';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function buildTemplateData(
  fields: FieldDefinition[],
  tables: TableDefinition[]
): Record<string, unknown> {
  const data: Record<string, unknown> = Object.fromEntries(fields.map((f) => [f.key, f.value]));
  for (const table of tables) {
    data[table.varName] = table.rows.map((row) =>
      Object.fromEntries(table.columns.map((col) => [col.key, row[col.key] ?? '']))
    );
  }
  return data;
}

function buildAdditionalContext(
  fields: FieldDefinition[],
  tables: TableDefinition[]
): Record<string, unknown> {
  const data = buildTemplateData(fields, tables);
  const getRows = (varName: string) =>
    tables.find((t) => t.varName === varName)?.rows ?? [];

  return {
    ...data,
    SUM(varName: string, colKey: string): number {
      return getRows(varName).reduce((acc, row) => {
        const val = parseFloat(row[colKey] ?? '0');
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
    },
    AVG(varName: string, colKey: string): number {
      const rows = getRows(varName);
      if (!rows.length) return 0;
      const total = rows.reduce((acc, row) => acc + (parseFloat(row[colKey] ?? '0') || 0), 0);
      return total / rows.length;
    },
    COUNT(varName: string): number {
      return getRows(varName).length;
    },
    MIN(varName: string, colKey: string): number {
      const rows = getRows(varName);
      if (!rows.length) return 0;
      return Math.min(...rows.map((r) => parseFloat(r[colKey] ?? '0') || 0));
    },
    MAX(varName: string, colKey: string): number {
      const rows = getRows(varName);
      if (!rows.length) return 0;
      return Math.max(...rows.map((r) => parseFloat(r[colKey] ?? '0') || 0));
    },
  };
}

function toBlob(buffer: Uint8Array): Blob {
  return new Blob([buffer as unknown as BlobPart], { type: DOCX_MIME });
}

type Status = 'idle' | 'generating' | 'ready';

const StatusDot = ({ status }: { status: Status }) => (
  <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: status === 'generating' ? '#f59e0b' : '#22c55e',
        boxShadow: status === 'generating' ? '0 0 0 2px #fef3c7' : '0 0 0 2px #dcfce7',
      }}
    />
    {status === 'generating' ? 'Updating preview…' : 'Auto-preview active'}
  </span>
);

const DocxPreview = memo(
  forwardRef<DocxPreviewHandle>((_, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<Status>('idle');

    const renderBlob = useCallback(async (blob: Blob) => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      await renderAsync(blob, containerRef.current);
      const style = document.createElement('style');
      style.textContent = `
        .docx-wrapper * { text-align: left !important; }
        .docx-wrapper table { margin: 0 auto; }
      `;
      containerRef.current.appendChild(style);
    }, []);

    useImperativeHandle(ref, () => ({
      async generate(templateBuffer, fields, tables, silent = false) {
        setStatus('generating');
        try {
          const data = buildTemplateData(fields, tables);
          const buffer = (await createReport({
            template: templateBuffer,
            data,
            additionalJsContext: buildAdditionalContext(fields, tables),
            cmdDelimiter: ['{', '}'],
            noSandbox: true,
            fixSmartQuotes: true,
            ...(silent
              ? { errorHandler: async (_err: Error, code?: string) => `{${code ?? ''}}` }
              : {}),
          })) as Uint8Array;

          await renderBlob(toBlob(buffer));
          setStatus('ready');
          return buffer;
        } catch (error) {
          setStatus('ready');
          if (!silent) {
            const msg = error instanceof Error ? error.message : String(error);
            const match = msg.match(/executing command '([^']+)'/);
            alert(
              match
                ? `Template variable "{${match[1]}}" is not defined.\n\nAdd a field with key "${match[1]}" above.`
                : `Error generating document:\n${msg}`
            );
          }
          return null;
        }
      },

      async renderRaw(buffer) {
        await renderBlob(toBlob(buffer));
        setStatus('ready');
      },
    }));

    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontWeight: 600, fontSize: '14px', color: '#111827', margin: 0 }}>
            Preview by{' '}
            <a
              href="https://www.npmjs.com/package/docx-preview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <em>docx-preview</em>
            </a>{' '}
            package
          </h3>
          {status !== 'idle' && <StatusDot status={status} />}
        </div>
        <div ref={containerRef} style={{ padding: '24px', minHeight: '500px' }} />
      </div>
    );
  })
);

export default DocxPreview;
