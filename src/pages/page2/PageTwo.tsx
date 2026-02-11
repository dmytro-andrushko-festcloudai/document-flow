import { useState } from 'react';
import type { Template } from '@pdfme/common';
import { BLANK_A4_PDF } from '@pdfme/common';
import InputBlock from './components/InputBlock';
import ViewBlock from './components/ViewBlock';
import DesignerBlock from './components/DesignerBlock';

export default function About() {
  const [template, setTemplate] = useState<Template>({
    basePdf: BLANK_A4_PDF, // Blank A4 PDF
    schemas: [
      [
        { name: 'title', type: 'text', position: { x: 10, y: 30 }, width: 190, height: 20 },
        { name: 'client', type: 'text', position: { x: 10, y: 60 }, width: 190, height: 20 },
        { name: 'details', type: 'text', position: { x: 10, y: 90 }, width: 190, height: 60 },
      ],
    ],
  });
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    details: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div style={{ display: 'flex', height: '50vh' }}>
        <InputBlock formData={formData} handleChange={handleChange} />
        <ViewBlock template={template} formData={formData} />
      </div>
      <DesignerBlock template={template} setTemplate={setTemplate} />
    </div>
  );
}
