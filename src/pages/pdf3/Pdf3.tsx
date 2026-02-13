import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use local worker file from public folder
if (typeof window !== 'undefined') {
  // Use local worker file copied from node_modules to ensure exact version match
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/document-flow/pdf.worker.min.mjs';
  console.log('PDF.js version:', pdfjsLib.version);
  console.log('Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
}

export default function Pdf3() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      await loadPDF(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const loadPDF = async (file: File) => {
    try {
      console.log('Loading PDF file:', file.name, 'Size:', file.size);

      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

      // Simple loading approach with CDN worker
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded successfully:', pdf.numPages, 'pages');

      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Error loading PDF file. ';
      if (error instanceof Error) {
        if (error.message.includes('InvalidPDFException')) {
          errorMessage += 'The file appears to be corrupted or not a valid PDF.';
        } else if (error.message.includes('MissingPDFException')) {
          errorMessage += 'The PDF file could not be found or read.';
        } else if (error.message.includes('UnexpectedResponseException')) {
          errorMessage += 'Unexpected response when loading the PDF.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please check the file and try again.';
      }

      alert(errorMessage);
    }
  };

  useEffect(() => {
    const renderPage = async (pageNum: number) => {
      if (!pdfDocument || !canvasRef.current) return;

      try {
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    if (pdfDocument && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDocument, currentPage, scale]);

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <h1 className="text-3xl font-medium mb-6">PDF Viewer with PDF.js</h1>

      <h3 style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        pdf viewer using{'  '}
        <a
          href="https://www.npmjs.com/package/pdfjs-dist"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <em>PDF.js</em>
        </a>{' '}
        package
      </h3>

      <p style={{ marginBottom: '20px' }}>
        Upload a PDF file to view it in the browser using PDF.js, Mozilla's JavaScript PDF library.
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
        </div>

        {pdfDocument && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <Button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
              Next
            </Button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button onClick={zoomOut} variant="outline" size="sm">
                Zoom Out
              </Button>
              <span>{Math.round(scale * 100)}%</span>
              <Button onClick={zoomIn} variant="outline" size="sm">
                Zoom In
              </Button>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          minHeight: '600px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#f5f5f5',
        }}
      >
        {!pdfFile ? (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p>Choose a PDF file to view it here</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        )}
      </div>
    </div>
  );
}
