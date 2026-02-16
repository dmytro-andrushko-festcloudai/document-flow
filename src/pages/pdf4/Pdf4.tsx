import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Pdf4() {
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // Create a URL for the uploaded file
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const downloadExample = () => {
    const link = document.createElement('a');
    link.href = '/example.pdf';
    link.download = 'example.pdf';
    link.click();
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <h1 className="text-3xl font-medium mb-6">PDF Viewer with iframe & object</h1>

      <h3 style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        pdf viewer using{'  '}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <em>&lt;iframe&gt;</em>
        </a>{' '}
        and{' '}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <em>&lt;object&gt;</em>
        </a>{' '}
        tags
      </h3>

      <p style={{ marginBottom: '20px' }}>
        Upload a PDF file to view it using native browser PDF rendering with iframe and object
        elements.
      </p>

      <div style={{ marginBottom: '24px' }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="pdf-upload"
        />
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <Button onClick={() => document.getElementById('pdf-upload')?.click()} variant="outline">
            Choose PDF File
          </Button>
          <Button onClick={downloadExample} variant="outline">
            Download Example PDF
          </Button>
        </div>
      </div>

      {pdfUrl && (
        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">iframe Viewer</TabsTrigger>
            <TabsTrigger value="object">object Viewer</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="mt-4">
            <div
              style={{
                border: '1px solid #ccc',
                padding: '20px',
                minHeight: '600px',
                backgroundColor: '#f5f5f5',
              }}
            >
              <h4 className="text-lg font-semibold mb-4">PDF Viewer using &lt;iframe&gt;</h4>
              <iframe
                src={pdfUrl}
                width="100%"
                height="600px"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
                title="PDF Viewer"
              >
                <p>
                  Unable to display PDF.{' '}
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    Download it here
                  </a>
                  .
                </p>
              </iframe>
            </div>
          </TabsContent>

          <TabsContent value="object" className="mt-4">
            <div
              style={{
                border: '1px solid #ccc',
                padding: '20px',
                minHeight: '600px',
                backgroundColor: '#f5f5f5',
              }}
            >
              <h4 className="text-lg font-semibold mb-4">PDF Viewer using &lt;object&gt;</h4>
              <object
                data={pdfUrl}
                type="application/pdf"
                width="100%"
                height="600px"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <p>
                  Unable to display PDF.{' '}
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    Download it here
                  </a>
                  .
                </p>
              </object>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!pdfUrl && (
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            minHeight: '600px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
          }}
        >
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p>Choose a PDF file to view it here</p>
          </div>
        </div>
      )}
    </div>
  );
}
