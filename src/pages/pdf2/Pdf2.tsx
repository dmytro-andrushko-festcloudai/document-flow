import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { Template } from '@pdfme/common';
import { BLANK_A4_PDF } from '@pdfme/common';
import { Form, Designer } from '@pdfme/ui';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { INITIAL_FORM_DATA } from '@/constants';

export default function Pdf2() {
  const [companyName, setCompanyName] = useState(INITIAL_FORM_DATA.companyName);
  const [companyAddress, setCompanyAddress] = useState(INITIAL_FORM_DATA.companyAddress);
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState(
    INITIAL_FORM_DATA.companyPhoneNumber
  );
  const [clientCompanyName, setClientCompanyName] = useState(INITIAL_FORM_DATA.clientCompanyName);
  const [clientAddress, setClientAddress] = useState(INITIAL_FORM_DATA.clientAddress);
  const [clientPhoneNumber, setClientPhoneNumber] = useState(INITIAL_FORM_DATA.clientPhoneNumber);
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
  const designerRef = useRef<HTMLDivElement>(null);

  const formData = useMemo(
    () => ({
      companyName,
      companyAddress,
      companyPhoneNumber,
      clientCompanyName,
      clientAddress,
      clientPhoneNumber,
    }),
    [
      companyName,
      companyAddress,
      companyPhoneNumber,
      clientCompanyName,
      clientAddress,
      clientPhoneNumber,
    ]
  );

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
        options: {
          readOnly: true,
          height: 800,
        },
      });
    }
    if (designerRef.current) {
      // Clear previous designer
      designerRef.current.innerHTML = '';
      // Create new Designer instance
      new Designer({
        template,
        domContainer: designerRef.current,
        options: {
          height: 800,
        },
      });
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
      <h1 className="text-3xl font-medium mb-6">PDF Forms with @pdfme/ui</h1>

      <h3 style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        pdf forms created with{'  '}
        <a
          href="https://www.npmjs.com/package/@pdfme/ui"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <em>@pdfme/ui</em>
        </a>{' '}
        package
      </h3>
      <div style={{ marginBottom: '52px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Company Information</h4>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
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
            <div style={{ flex: 1 }}>
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
            <div style={{ flex: 1 }}>
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
          </div>
        </div>
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Client Information</h4>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
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
            <div style={{ flex: 1 }}>
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
            <div style={{ flex: 1 }}>
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
          </div>
        </div>

        <div style={{ marginBottom: '20px', marginTop: '20px' }}>
          <h3>Import PDF Template</h3>
          <input type="file" accept=".pdf" onChange={handleFileUpload} />
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
        <Button onClick={generatePreview}>Generate Preview</Button>
        <Button onClick={downloadDocument} disabled>
          Download (Not Available)
        </Button>
      </div>

      <Tabs
        defaultValue="preview"
        className="w-full"
        onValueChange={() => {
          generatePreview();
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-6">
          <div
            ref={previewRef}
            style={{
              border: '1px solid #ccc',
              height: '800px',
              minHeight: '800px',
            }}
          />
        </TabsContent>
        <TabsContent value="edit" className="mt-6">
          <div
            ref={designerRef}
            style={{
              border: '1px solid #ccc',
              height: '800px',
              minHeight: '800px',
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
