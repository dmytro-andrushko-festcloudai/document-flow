import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PageOne from './pages/page1/PageOne';
import PageTwo from './pages/page2/PageTwo';
import Contact from './pages/page3/PageThree';
import Page4 from './pages/page4/Page4';
import './App.css';

function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/">@react-pdf/renderer </Link>
        <Link to="/page2">@pdfme</Link>
        <Link to="/page3">docxtemplater</Link>
        <Link to="/page4">Docx-templates</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PageOne />} />
        <Route path="/page2" element={<PageTwo />} />
        <Route path="/page3" element={<Contact />} />
        <Route path="/page4" element={<Page4 />} />
      </Routes>
    </Router>
  );
}

export default App;
