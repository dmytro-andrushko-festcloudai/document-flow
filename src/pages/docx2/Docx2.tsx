import { useState, useCallback, useEffect, useRef, memo, useImperativeHandle, forwardRef } from 'react';
import { createReport } from 'docx-templates';
import { renderAsync } from 'docx-preview';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import invoiceUrl from '@/assets/INVOICE.docx?url';

interface FieldDefinition {
  id: string;
  key: string;
  label: string;
  value: string;
}

export interface DocxPreviewHandle {
  generate: (
    templateBuffer: Uint8Array,
    fields: FieldDefinition[],
    silent?: boolean
  ) => Promise<Uint8Array | null>;
  renderRaw: (buffer: Uint8Array) => Promise<void>;
}

const STORAGE_KEY = 'docx2_fields';

function loadFields(): FieldDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FieldDefinition[]) : [];
  } catch {
    return [];
  }
}

function saveFields(fields: FieldDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

// ---------------------------------------------------------------------------
// Isolated preview component — re-renders only when document changes
// ---------------------------------------------------------------------------
const DocxPreview = memo(
  forwardRef<DocxPreviewHandle>((_, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'idle' | 'generating' | 'ready'>('idle');

    const applyPreviewStyles = (container: HTMLDivElement) => {
      const style = document.createElement('style');
      style.textContent = `
        .docx-wrapper * { text-align: left !important; }
        .docx-wrapper table { margin: 0 auto; }
      `;
      container.appendChild(style);
    };

    const renderBlob = useCallback(async (blob: Blob) => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      await renderAsync(blob, containerRef.current);
      applyPreviewStyles(containerRef.current);
    }, []);

    useImperativeHandle(ref, () => ({
      async generate(templateBuffer, fields, silent = false) {
        setStatus('generating');
        try {
          const additionalJsContext = Object.fromEntries(fields.map((f) => [f.key, f.value]));

          const buffer = (await createReport({
            template: templateBuffer,
            data: {},
            additionalJsContext,
            cmdDelimiter: ['{', '}'],
            noSandbox: true,
            fixSmartQuotes: true,
            ...(silent
              ? { errorHandler: async (_err: Error, code?: string) => `{${code ?? ''}}` }
              : {}),
          })) as Uint8Array;

          const blob = new Blob([buffer as any], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          await renderBlob(blob);
          setStatus('ready');
          return buffer;
        } catch (error) {
          setStatus('ready');
          if (!silent) {
            const msg = error instanceof Error ? error.message : String(error);
            const match = msg.match(/executing command '([^']+)'/);
            if (match) {
              alert(
                `Template variable "{${match[1]}}" is not defined.\n\nAdd a field with key "${match[1]}" in the "Define template fields" section above.`
              );
            } else {
              alert(`Error generating document:\n${msg}`);
            }
          }
          return null;
        }
      },

      async renderRaw(buffer) {
        const blob = new Blob([buffer as any], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        await renderBlob(blob);
        setStatus('ready');
      },
    }));

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
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
          {status !== 'idle' && (
            <span
              style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: status === 'generating' ? '#f59e0b' : '#22c55e',
                  boxShadow:
                    status === 'generating' ? '0 0 0 2px #fef3c7' : '0 0 0 2px #dcfce7',
                }}
              />
              {status === 'generating' ? 'Updating preview…' : 'Auto-preview active'}
            </span>
          )}
        </div>

        <div
          ref={containerRef}
          style={{ padding: '24px', minHeight: '500px' }}
        />
      </div>
    );
  })
);

// ---------------------------------------------------------------------------
// Main component — manages fields and template, never re-renders for preview
// ---------------------------------------------------------------------------
const Docx2 = () => {
  const [fields, setFields] = useState<FieldDefinition[]>(loadFields);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [templateBuffer, setTemplateBuffer] = useState<Uint8Array | null>(null);
  const [generatedBuffer, setGeneratedBuffer] = useState<Uint8Array | null>(null);

  const previewRef = useRef<DocxPreviewHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep latest values accessible in debounce without re-creating the effect
  const templateBufferRef = useRef<Uint8Array | null>(null);
  const fieldsRef = useRef<FieldDefinition[]>(fields);

  useEffect(() => {
    templateBufferRef.current = templateBuffer;
  }, [templateBuffer]);

  useEffect(() => {
    fieldsRef.current = fields;
    saveFields(fields);
  }, [fields]);

  const scheduleGenerate = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const buf = templateBufferRef.current;
      if (!buf) return;
      const result = await previewRef.current?.generate(buf, fieldsRef.current, true);
      if (result) setGeneratedBuffer(result);
    }, 600);
  }, []);

  // Trigger auto-generate on fields or template change
  useEffect(() => {
    if (!templateBuffer) return;
    scheduleGenerate();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, templateBuffer]);

  const addField = () => {
    const trimmedKey = newKey.trim();
    const trimmedLabel = newLabel.trim();
    if (!trimmedKey || !trimmedLabel) return;
    if (fields.some((f) => f.key === trimmedKey)) {
      alert(`Field with key "${trimmedKey}" already exists.`);
      return;
    }
    setFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: trimmedKey, label: trimmedLabel, value: '' },
    ]);
    setNewKey('');
    setNewLabel('');
  };

  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id));

  const updateFieldValue = (id: string, value: string) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));

  const clearAllFields = () => {
    if (fields.length === 0) return;
    if (confirm('Clear all fields? This will also remove saved data.')) setFields([]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        setTemplateBuffer(buffer);
        setGeneratedBuffer(null);
        await previewRef.current?.renderRaw(buffer);
      } catch (error) {
        console.error('Error loading docx:', error);
        alert('Error loading the document. Please check the file.');
      }
    } else {
      alert('Please select a valid .docx file.');
    }
  };

  const downloadDocument = () => {
    if (!generatedBuffer) return;
    const blob = new Blob([generatedBuffer as any], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filled_document.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadExample = () => {
    const link = document.createElement('a');
    link.href = invoiceUrl;
    link.download = 'INVOICE.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addField();
  };

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

  return (
    <div className="field-builder-row">
      <div style={{ textAlign: 'left' }}>
      <h1 className="text-3xl font-medium mb-6">Templating for docx file with docx-templates</h1>

      {/* Info card */}
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
          Standard tags like <b>{`{firstName}`}</b> are replaced with the corresponding string
          value from your JSON data.
        </p>
        <Button onClick={downloadExample} variant="outline" style={{ fontSize: '13px' }}>
          Download example DOCX template
        </Button>
      </div>

      {/* Field builder card */}
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
              onClick={clearAllFields}
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
                (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
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
              type="text"
              placeholder="e.g. companyName"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={handleAddKeyDown}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}
            >
              Label (shown in form)
            </label>
            <Input
              type="text"
              placeholder="e.g. Company Name"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleAddKeyDown}
            />
          </div>
          <Button
            onClick={addField}
            disabled={!newKey.trim() || !newLabel.trim()}
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
                      width: '30%',
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
                      {field.label}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => removeField(field.id)}
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
                        onMouseEnter={(e) =>
                          ((e.target as HTMLButtonElement).style.color = '#ef4444')
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLButtonElement).style.color = '#9ca3af')
                        }
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

      {/* Fill in values card */}
      {fields.length > 0 && (
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
                  style={{
                    fontSize: '13px',
                    color: '#374151',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {field.label}{' '}
                  <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px' }}>
                    {`{${field.key}}`}
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={field.value}
                  onChange={(e) => updateFieldValue(field.id, e.target.value)}
                />
              </div>
            ))}
          </div>
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
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
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
