import { useState, useCallback, useRef, useEffect } from 'react';
import { createReport } from 'docx-templates';
import { renderAsync } from 'docx-preview';

const Page4 = () => {
  const loadInitialData = () => {
    const data = localStorage.getItem('page4FormData');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        companyAddress: parsed.companyAddress || 'Lviv, Ukraine',
        companyPhoneNumber: parsed.companyPhoneNumber || '032-12345678',
        companyName: parsed.companyName || 'Festcloud.ai',
        clientCompanyName: parsed.clientCompanyName || 'Zahidfest',
        clientAddress: parsed.clientAddress || 'Lviv, Ukraine',
        clientPhoneNumber: parsed.clientPhoneNumber || '032-87654321',
      };
    }
    return {
      companyAddress: 'Lviv, Ukraine',
      companyPhoneNumber: '032-12345678',
      companyName: 'Festcloud.ai',
      clientCompanyName: 'Zahidfest',
      clientAddress: 'Lviv, Ukraine',
      clientPhoneNumber: '032-87654321',
    };
  };

  const initialData = loadInitialData();

  const [companyAddress, setCompanyAddress] = useState(initialData.companyAddress);
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState(initialData.companyPhoneNumber);
  const [companyName, setCompanyName] = useState(initialData.companyName);
  const [clientCompanyName, setClientCompanyName] = useState(initialData.clientCompanyName);
  const [clientAddress, setClientAddress] = useState(initialData.clientAddress);
  const [clientPhoneNumber, setClientPhoneNumber] = useState(initialData.clientPhoneNumber);
  const [templateBuffer, setTemplateBuffer] = useState<Uint8Array | null>(null);
  const [generatedBuffer, setGeneratedBuffer] = useState<Uint8Array | null>(null);
  const [myFile, setMyFile] = useState<File | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveToLocalStorage = useCallback(() => {
    const data = {
      companyAddress,
      companyPhoneNumber,
      companyName,
      clientCompanyName,
      clientAddress,
      clientPhoneNumber,
    };
    localStorage.setItem('page4FormData', JSON.stringify(data));
  }, [
    companyAddress,
    companyPhoneNumber,
    companyName,
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
    companyAddress,
    companyPhoneNumber,
    companyName,
    clientCompanyName,
    clientAddress,
    clientPhoneNumber,
    saveToLocalStorage,
  ]);

  const readFileIntoArrayBuffer = (fd: File) =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(fd);
    });

  const saveDataToFile = (data: Uint8Array, fileName: string, mimeType: string) => {
    const blob = new Blob([data as any], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onTemplateChosen = async () => {
    const templateArrayBuffer = await readFileIntoArrayBuffer(myFile!);
    const template = new Uint8Array(templateArrayBuffer);
    const report = await createReport({
      template,
      data: { name: 'John', surname: 'Appleseed' },
      noSandbox: true,
    });
    saveDataToFile(
      report,
      'report.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  };

  const generatePreview = useCallback(async () => {
    if (!templateBuffer) return;
    try {
      const data = {
        companyAddress,
        companyPhoneNumber,
        companyName,
        clientCompanyName,
        clientAddress,
        clientPhoneNumber,
      };

      // Generate the report using docx-templates
      const buffer = (await createReport({
        template: templateBuffer,
        data: data,
        cmdDelimiter: ['{', '}'],
        noSandbox: true,
      })) as Uint8Array;

      setGeneratedBuffer(buffer);

      const blob = new Blob([buffer as any], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Clear and render preview
      if (previewRef.current) {
        previewRef.current.innerHTML = '';
        await renderAsync(blob, previewRef.current);

        // Add CSS to left-align content
        const style = document.createElement('style');
        style.textContent = `
          .docx-wrapper * { text-align: left !important; }
          .docx-wrapper table { margin: 0 auto; }
        `;
        previewRef.current.appendChild(style);
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
        const uint8Array = new Uint8Array(arrayBuffer);
        setTemplateBuffer(uint8Array);
        setGeneratedBuffer(null); // Reset generated buffer when new template is loaded
        setMyFile(file);
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

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>DOCX Templates</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Fill Template</h3>
        <div>
          <label>
            Company Name:
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Company Address:
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Company Phone Number:
            <input
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
            <input
              type="text"
              value={clientCompanyName}
              onChange={(e) => setClientCompanyName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Client Address:
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Client Phone Number:
            <input
              type="tel"
              value={clientPhoneNumber}
              onChange={(e) => setClientPhoneNumber(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Import DOCX Template</h3>
          <input type="file" accept=".docx" onChange={handleFileUpload} />
        </div>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={generatePreview} disabled={!templateBuffer}>
          Generate Document
        </button>
        <button onClick={downloadDocument} disabled={!generatedBuffer}>
          Download Filled Document
        </button>
        <button onClick={onTemplateChosen} disabled={!myFile}>
          Generate Simple Report
        </button>
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
};

export default Page4;
