import { useState, useCallback, useEffect, useRef } from 'react';
import type { Template } from '@pdfme/common';
import { BLANK_A4_PDF } from '@pdfme/common';
import { Form } from '@pdfme/ui';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function About() {
  const loadInitialData = () => {
    const data = localStorage.getItem('page2FormData');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        companyName: parsed.companyName || 'Festcloud.ai',
        companyAddress: parsed.companyAddress || 'Lviv, Ukraine',
        companyPhoneNumber: parsed.companyPhoneNumber || '032-12345678',
        clientCompanyName: parsed.clientCompanyName || 'Zahidfest',
        clientAddress: parsed.clientAddress || 'Lviv, Ukraine',
        clientPhoneNumber: parsed.clientPhoneNumber || '032-87654321',
      };
    }
    return {
      companyName: 'Festcloud.ai',
      companyAddress: 'Lviv, Ukraine',
      companyPhoneNumber: '032-12345678',
      clientCompanyName: 'Zahidfest',
      clientAddress: 'Lviv, Ukraine',
      clientPhoneNumber: '032-87654321',
    };
  };

  const initialData = loadInitialData();

  const [companyName, setCompanyName] = useState(initialData.companyName);
  const [companyAddress, setCompanyAddress] = useState(initialData.companyAddress);
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState(initialData.companyPhoneNumber);
  const [clientCompanyName, setClientCompanyName] = useState(initialData.clientCompanyName);
  const [clientAddress, setClientAddress] = useState(initialData.clientAddress);
  const [clientPhoneNumber, setClientPhoneNumber] = useState(initialData.clientPhoneNumber);
  const [template, setTemplate] = useState<Template>({
    basePdf: BLANK_A4_PDF,
    schemas: [
      [
        { name: 'companyName', type: 'text', position: { x: 10, y: 30 }, width: 190, height: 20 },
        {
          name: 'companyAddress',
          type: 'text',
          position: { x: 10, y: 60 },
          width: 190,
          height: 20,
        },
        {
          name: 'companyPhoneNumber',
          type: 'text',
          position: { x: 10, y: 90 },
          width: 190,
          height: 20,
        },
        {
          name: 'clientCompanyName',
          type: 'text',
          position: { x: 10, y: 120 },
          width: 190,
          height: 20,
        },
        {
          name: 'clientAddress',
          type: 'text',
          position: { x: 10, y: 150 },
          width: 190,
          height: 20,
        },
        {
          name: 'clientPhoneNumber',
          type: 'text',
          position: { x: 10, y: 180 },
          width: 190,
          height: 20,
        },
      ],
    ],
  });
  const previewRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveToLocalStorage = useCallback(() => {
    const data = {
      companyName,
      companyAddress,
      companyPhoneNumber,
      clientCompanyName,
      clientAddress,
      clientPhoneNumber,
    };
    localStorage.setItem('page2FormData', JSON.stringify(data));
  }, [
    companyName,
    companyAddress,
    companyPhoneNumber,
    clientCompanyName,
    clientAddress,
    clientPhoneNumber,
  ]);

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, 2000);
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    companyName,
    companyAddress,
    companyPhoneNumber,
    clientCompanyName,
    clientAddress,
    clientPhoneNumber,
    saveToLocalStorage,
  ]);

  const formData = {
    companyName,
    companyAddress,
    companyPhoneNumber,
    clientCompanyName,
    clientAddress,
    clientPhoneNumber,
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Update template with new PDF
        setTemplate((prev) => ({
          ...prev,
          basePdf: new Uint8Array(arrayBuffer),
        }));
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading the PDF. Please check the file.');
      }
    } else {
      alert('Please select a valid .pdf file.');
    }
  };

  const generatePreview = useCallback(async () => {
    if (previewRef.current) {
      // Clear previous form
      previewRef.current.innerHTML = '';
      // Create new Form instance for preview
      new Form({
        template,
        inputs: [formData],
        domContainer: previewRef.current,
        options: { readOnly: true },
      });

      // Note: @pdfme/ui doesn't provide direct PDF generation in browser
      // For now, we'll just show the preview. PDF generation would require
      // server-side processing or additional libraries
    }
  }, [template, formData]);

  const downloadDocument = () => {
    alert(
      'PDF generation is not directly supported by @pdfme/ui in the browser. Please use the preview for now.'
    );
  };

  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  return (
    <div>
      <h2>PDF Forms with @pdfme/ui</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Fill Template</h3>
        <div>
          <label>
            Company Name:
            <br />
            <Input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Company Address:
            <br />
            <Input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Company Phone Number:
            <br />
            <Input
              type="tel"
              value={companyPhoneNumber}
              onChange={(e) => setCompanyPhoneNumber(e.target.value)}
            />
          </label>
        </div>
        <br />
        <div>
          <label>
            Client Company Name:
            <br />
            <Input
              type="text"
              value={clientCompanyName}
              onChange={(e) => setClientCompanyName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Client Address:
            <br />
            <Input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Client Phone Number:
            <br />
            <Input
              type="tel"
              value={clientPhoneNumber}
              onChange={(e) => setClientPhoneNumber(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px', marginTop: '20px' }}>
          <h3>Import PDF Template</h3>
          <input type="file" accept=".pdf" onChange={handleFileUpload} />
        </div>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <Button onClick={generatePreview}>Generate Preview</Button>
        <Button onClick={downloadDocument} disabled>
          Download (Not Available)
        </Button>
      </div>

      <div
        ref={previewRef}
        style={{
          marginTop: '20px',
          border: '1px solid #ccc',
          padding: '20px',
          minHeight: '500px',
        }}
      />
    </div>
  );
}
