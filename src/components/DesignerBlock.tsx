import { useRef, useLayoutEffect } from 'react';
import type { Template } from '@pdfme/common';
import { Designer } from '@pdfme/ui';

interface DesignerBlockProps {
  template: Template;
  setTemplate: (template: Template) => void;
}

export default function DesignerBlock({ template, setTemplate }: DesignerBlockProps) {
  const designerRef = useRef<HTMLDivElement>(null);
  const designerInstanceRef = useRef<Designer | null>(null);

  useLayoutEffect(() => {
    if (designerRef.current) {
      // Destroy previous designer instance
      if (designerInstanceRef.current) {
        designerInstanceRef.current.destroy();
        designerRef.current.innerHTML = '';
      }
      try {
        // Create new Designer instance
        designerInstanceRef.current = new Designer({
          template,
          domContainer: designerRef.current,
          options: {
            onChangeTemplate: setTemplate,
            zoomLevel: 1,
            sidebarOpen: true,
          },
        });
      } catch (error) {
        console.error('Error creating Designer:', error);
      }
    }
  }, [template, setTemplate]);

  return (
    <div style={{ height: '50vh', padding: 24 }}>
      <h2>Template Designer</h2>
      <div ref={designerRef} style={{ height: '400px', position: 'relative' }} />
    </div>
  );
}
