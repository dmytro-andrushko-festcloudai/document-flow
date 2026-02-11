import React from 'react';

interface InputBlockProps {
  formData: {
    title: string;
    client: string;
    details: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function InputBlock({ formData, handleChange }: InputBlockProps) {
  return (
    <div style={{ flex: 1, padding: 24, borderRight: '1px solid #ccc' }}>
      <h2>Fill in the form</h2>
      <label>
        Contract Title:
        <br />
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </label>
      <br />
      <br />
      <label>
        Client Name:
        <br />
        <input
          name="client"
          value={formData.client}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </label>
      <br />
      <br />
      <label>
        Details:
        <br />
        <textarea
          name="details"
          value={formData.details}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </label>
    </div>
  );
}
