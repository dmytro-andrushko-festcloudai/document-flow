import { useRef, useEffect } from 'react';
import type { Template } from '@pdfme/common';
import { Form } from '@pdfme/ui';

interface ViewBlockProps {
  template: Template;
  formData: {
    title: string;
    client: string;
    details: string;
  };
}

export default function ViewBlock({ template, formData }: ViewBlockProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const formInstanceRef = useRef<Form | null>(null);

  useEffect(() => {
    if (viewerRef.current) {
      // Destroy previous form instance and clear DOM
      if (formInstanceRef.current) {
        formInstanceRef.current.destroy();
        viewerRef.current.innerHTML = '';
      }
      // Create new Form instance in read-only mode for preview
      formInstanceRef.current = new Form({
        template,
        inputs: [formData],
        domContainer: viewerRef.current,
        options: { readOnly: true },
      });
    }
  }, [formData, template]);

  return (
    <div style={{ flex: 1, padding: 24 }}>
      <h2>Document Preview</h2>
      <div ref={viewerRef} style={{ height: '400px' }} />
    </div>
  );
}
