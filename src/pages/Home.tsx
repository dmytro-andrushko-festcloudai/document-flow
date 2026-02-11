import { useState } from 'react';
import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
});

function MyDocument({ formData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Contract Title: {formData.title}</Text>
        </View>
        <View style={styles.section}>
          <Text>Client Name: {formData.client}</Text>
        </View>
        <View style={styles.section}>
          <Text>Details: {formData.details}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function Home() {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    details: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
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
      <div style={{ flex: 1, padding: 24 }}>
        <h2>Document Preview</h2>
        <PDFViewer width="100%" height="90%">
          <MyDocument formData={formData} />
        </PDFViewer>
      </div>
    </div>
  );
}
