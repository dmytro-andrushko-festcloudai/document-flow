import { useRef, useEffect } from 'react';
import type { Template } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { text, image, barcodes } from '@pdfme/schemas'; // Crucial: Plugins must be provided

interface DesignerBlockProps {
  template: Template;
  setTemplate: (template: Template) => void;
}

export default function DesignerBlock({ template, setTemplate }: DesignerBlockProps) {
  const designerRef = useRef<HTMLDivElement>(null);
  const designerInstanceRef = useRef<Designer | null>(null);

  useEffect(() => {
    // Only initialize if the container exists and the instance doesn't
    if (designerRef.current && !designerInstanceRef.current) {
      
      designerInstanceRef.current = new Designer({
        domContainer: designerRef.current,
        template: template,
        // plugins: Define which tools appear in the editor
        plugins: {
          text,
          image,
          qrcode: barcodes.qrcode,
        },
      });

      // Listen for changes inside the designer
      designerInstanceRef.current.onChangeTemplate((updatedTemplate) => {
        setTemplate(updatedTemplate);
      });
    }

    // Cleanup on unmount
    return () => {
      if (designerInstanceRef.current) {
        designerInstanceRef.current.destroy();
        designerInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs ONCE

  return (
    <div style={{ height: '70vh', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div ref={designerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}