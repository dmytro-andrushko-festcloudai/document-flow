import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Suspense } from 'react';

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
import Docx3 from './pages/docx3/Docx3';
import Docx4 from './pages/docx4/Docx4';
import Docx5 from './pages/docx5/Docx5';
// import Pdf3 from './pages/pdf3/Pdf3';
import Pdf4 from './pages/pdf4/Pdf4';

function App() {
  return (
    <Router>
      <AppSidebar />
      <main className="min-h-screen overflow-auto p-6 ml-75">
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/docx1" replace />} />
            <Route path="/docx1" element={<Docx1 />} />
            <Route path="/docx2" element={<Docx2 />} />
            <Route path="/docx3" element={<Docx3 />} />
            <Route path="/docx4" element={<Docx4 />} />
            <Route path="/docx5" element={<Docx5 />} />
            <Route path="/pdf1" element={<Pdf1 />} />
            <Route path="/pdf2" element={<Pdf2 />} />
            {/* <Route path="/pdf3" element={<Pdf3 />} /> */}
            <Route path="/pdf4" element={<Pdf4 />} />
          </Routes>
        </Suspense>
      </main>
    </Router>
  );
}

function AppSidebar() {
  const location = useLocation();

  const pdfLibraries = [
    { name: '@react-pdf', href: '/pdf1' },
    { name: '@pdfme', href: '/pdf2' },
    // { name: 'PDF.js', href: '/pdf3' },
    { name: 'iframe & object', href: '/pdf4' },
  ];

  const docxLibraries = [
    { name: 'docxtemplater(paid modules)', href: '/docx1' },
    { name: 'docx-templates(free)', href: '/docx2' },
    { name: 'easy-template-x', href: '/docx5' },
  ];

  const docxEditors = [
    { name: 'tiptap', href: '/docx3' },
    { name: '@hufe921/canvas-editor', href: '/docx4' },
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
              DOCX Editors
            </h3>
            <SidebarMenu>
              {docxEditors.map((item) => (
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
