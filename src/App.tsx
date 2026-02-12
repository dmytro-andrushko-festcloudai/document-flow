import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PageOne from './pages/page1/PageOne';
import PageTwo from './pages/page2/PageTwo';
import Contact from './pages/page3/PageThree';
import './App.css';

function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/">@react-pdf/renderer </Link>
        <Link to="/about">@pdfme</Link>
        <Link to="/contact">docxtemplater</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PageOne />} />
        <Route path="/about" element={<PageTwo />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
