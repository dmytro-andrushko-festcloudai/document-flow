import { useState, useCallback, useRef } from 'react';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { renderAsync } from 'docx-preview';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import './style.css';

export default function Docx1() {
  const [companyAddress, setCompanyAddress] = useState('Lviv, Ukraine');
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState('032-12345678');
  const [companyName, setCompanyName] = useState('Festcloud.ai');
  const [clientCompanyName, setClientCompanyName] = useState('Zahidfest');
  const [clientAddress, setClientAddress] = useState('Lviv, Ukraine');
  const [clientPhoneNumber, setClientPhoneNumber] = useState('032-87654321');
  const [templateBuffer, setTemplateBuffer] = useState<ArrayBuffer | null>(null);
  const [generatedBuffer, setGeneratedBuffer] = useState<ArrayBuffer | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePreview = useCallback(async () => {
    if (!templateBuffer) return;
    try {
      const zip = new PizZip(templateBuffer);

      // Create docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{', end: '}' },
      });

      // Set the template variables and render
      doc.render({
        companyAddress,
        companyPhoneNumber,
        companyName,
        clientCompanyName,
        clientAddress,
        clientPhoneNumber,
      });

      // Get the generated document as array buffer
      const buffer = doc.getZip().generate({
        type: 'arraybuffer',
      });

      setGeneratedBuffer(buffer);

      // Create blob for preview
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Clear and render preview
      if (previewRef.current) {
        previewRef.current.innerHTML = '';
        await renderAsync(blob, previewRef.current);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document. Please check the inputs.');
    }
  }, [
    templateBuffer,
    companyAddress,
    companyPhoneNumber,
    companyName,
    clientCompanyName,
    clientAddress,
    clientPhoneNumber,
  ]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        setTemplateBuffer(arrayBuffer);
        setGeneratedBuffer(null); // Reset generated buffer when new template is loaded
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
    const blob = new Blob([generatedBuffer], {
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

  return (
    <div className="page3">
      <h2 className="text-3xl font-medium mb-6">DOCX Templating with docxtemplater</h2>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Company Information</h4>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label>
                Company Name:
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label>
                Company Address:
                <Input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label>
                Company Phone Number:
                <Input
                  type="tel"
                  value={companyPhoneNumber}
                  onChange={(e) => setCompanyPhoneNumber(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Client Information</h4>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label>
                Client Company Name:
                <Input
                  type="text"
                  value={clientCompanyName}
                  onChange={(e) => setClientCompanyName(e.target.value)}
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label>
                Client Address:
                <Input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label>
                Client Phone Number:
                <Input
                  type="tel"
                  value={clientPhoneNumber}
                  onChange={(e) => setClientPhoneNumber(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        accept=".docx"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        id="docx-upload"
      />
      <div
        style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-start' }}
      >
        <Button onClick={() => document.getElementById('docx-upload')?.click()} variant="outline">
          Choose DOCX File
        </Button>
        <Button onClick={generatePreview} disabled={!templateBuffer}>
          Generate Document
        </Button>
        <Button onClick={downloadDocument} disabled={!generatedBuffer}>
          Download Filled Document
        </Button>
      </div>

      <div
        ref={previewRef}
        style={{
          marginTop: '32px',
          border: '1px solid #ccc',
          padding: '20px',
          minHeight: '500px',
        }}
      />
    </div>
  );
}
