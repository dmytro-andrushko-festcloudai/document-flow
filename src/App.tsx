import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Pdf1 from './pages/pdf1/Pdf1';
import Pdf2 from './pages/pdf2/Pdf2';
import Docx1 from './pages/docx1/Docx1';
import Docx2 from './pages/docx2/Docx2';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './components/ui/sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <AppSidebar />
      <main className="min-h-screen overflow-auto p-6 ml-75">
        <Routes>
          <Route path="/" element={<Pdf1 />} />
          <Route path="/page2" element={<Pdf2 />} />
          <Route path="/page3" element={<Docx1 />} />
          <Route path="/page4" element={<Docx2 />} />
        </Routes>
      </main>
    </Router>
  );
}

function AppSidebar() {
  const location = useLocation();

  const pdfLibraries = [
    { name: '@react-pdf/renderer', href: '/' },
    { name: '@pdfme', href: '/page2' },
  ];

  const docxLibraries = [
    { name: 'docxtemplater', href: '/page3' },
    { name: 'Docx-templates', href: '/page4' },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-lg font-semibold">Document Flow</h1>
        <p className="text-sm text-muted-foreground">Research Demo App</p>
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-6">
          <div>
            <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              DOCX Libraries
            </h3>
            <SidebarMenu>
              {docxLibraries.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href}>
                      <span className="font-mono text-xs">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
          <div>
            <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              PDF Libraries
            </h3>
            <SidebarMenu>
              {pdfLibraries.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href}>
                      <span className="font-mono text-xs">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default App;
