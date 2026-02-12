import { useState, useCallback, useEffect, useRef } from 'react';
import { PDFViewer, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
});

function MyDocument({
  formData,
}: {
  formData: {
    companyName: string;
    companyAddress: string;
    companyPhoneNumber: string;
    clientCompanyName: string;
    clientAddress: string;
    clientPhoneNumber: string;
  };
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Company: {formData.companyName}</Text>
        </View>
        <View style={styles.section}>
          <Text>Address: {formData.companyAddress}</Text>
        </View>
        <View style={styles.section}>
          <Text>Phone: {formData.companyPhoneNumber}</Text>
        </View>
        <View style={styles.section}>
          <Text>Client: {formData.clientCompanyName}</Text>
        </View>
        <View style={styles.section}>
          <Text>Client Address: {formData.clientAddress}</Text>
        </View>
        <View style={styles.section}>
          <Text>Client Phone: {formData.clientPhoneNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function Home() {
  const loadInitialData = () => {
    const data = localStorage.getItem('page1FormData');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        companyName: parsed.companyName || 'Festcloud.ai',
        companyAddress: parsed.companyAddress || 'Lviv, Ukraine',
        companyPhoneNumber: parsed.companyPhoneNumber || '032-12345678',
        clientCompanyName: parsed.clientCompanyName || 'Zahidfest',
        clientAddress: parsed.clientAddress || 'Lviv, Ukraine',
        clientPhoneNumber: parsed.clientPhoneNumber || '032-87654321',
      };
    }
    return {
      companyName: 'Festcloud.ai',
      companyAddress: 'Lviv, Ukraine',
      companyPhoneNumber: '032-12345678',
      clientCompanyName: 'Zahidfest',
      clientAddress: 'Lviv, Ukraine',
      clientPhoneNumber: '032-87654321',
    };
  };

  const initialData = loadInitialData();

  const [companyName, setCompanyName] = useState(initialData.companyName);
  const [companyAddress, setCompanyAddress] = useState(initialData.companyAddress);
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState(initialData.companyPhoneNumber);
  const [clientCompanyName, setClientCompanyName] = useState(initialData.clientCompanyName);
  const [clientAddress, setClientAddress] = useState(initialData.clientAddress);
  const [clientPhoneNumber, setClientPhoneNumber] = useState(initialData.clientPhoneNumber);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveToLocalStorage = useCallback(() => {
    const data = {
      companyName,
      companyAddress,
      companyPhoneNumber,
      clientCompanyName,
      clientAddress,
      clientPhoneNumber,
    };
    localStorage.setItem('page1FormData', JSON.stringify(data));
  }, [
    companyName,
    companyAddress,
    companyPhoneNumber,
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
    companyName,
    companyAddress,
    companyPhoneNumber,
    clientCompanyName,
    clientAddress,
    clientPhoneNumber,
    saveToLocalStorage,
  ]);

  const formData = {
    companyName,
    companyAddress,
    companyPhoneNumber,
    clientCompanyName,
    clientAddress,
    clientPhoneNumber,
  };

  const downloadPDF = async () => {
    const blob = await pdf(<MyDocument formData={formData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>PDF Generation with @react-pdf/renderer</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Fill Template</h3>
        <div>
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
        <div>
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
        <div>
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
        <br />
        <div>
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
        <div>
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
        <div>
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

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <Button onClick={downloadPDF}>Download PDF</Button>
      </div>

      <div
        style={{
          marginTop: '20px',
          border: '1px solid #ccc',
          padding: '20px',
          minHeight: '500px',
        }}
      >
        <h2>Document Preview</h2>
        <PDFViewer width="100%" height="90%">
          <MyDocument formData={formData} />
        </PDFViewer>
      </div>
    </div>
  );
}
