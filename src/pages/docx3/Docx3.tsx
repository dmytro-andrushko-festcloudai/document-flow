import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
} from 'docx';
// 1. Import Lucide icons for the professional look
import {
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Type,
  Quote,
  Minus,
  Download,
  Plus,
  Upload,
  Table as TableIcon,
} from 'lucide-react';
// Import mammoth for DOCX to HTML conversion
import * as mammoth from 'mammoth';
// Import Tiptap table extensions
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';

export default function Docx3() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: `<h1>Document Template</h1><p>Start typing...</p>`,
    immediatelyRender: false,
  });

  const handleDownload = async () => {
    if (!editor) return;
    try {
      const htmlContent = editor.getHTML();

      // Parse HTML and convert to DOCX elements
      const docxElements = htmlToDocxElements(htmlContent);

      const doc = new Document({
        sections: [
          {
            children: docxElements,
          },
        ],
      });

      const buffer = await Packer.toBlob(doc);
      const url = URL.createObjectURL(buffer);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.docx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Helper function to convert HTML to DOCX elements
  const htmlToDocxElements = (html: string): any[] => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const elements: any[] = [];

    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          elements.push(new TextRun({ text, size: 24 }));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        switch (tagName) {
          case 'h1':
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: element.textContent || '', size: 32, bold: true })],
                spacing: { after: 400 },
              })
            );
            break;
          case 'h2':
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: element.textContent || '', size: 28, bold: true })],
                spacing: { after: 300 },
              })
            );
            break;
          case 'p':
            const paragraphChildren: any[] = [];
            element.childNodes.forEach((child) => {
              if (child.nodeType === Node.TEXT_NODE) {
                paragraphChildren.push(new TextRun({ text: child.textContent || '', size: 24 }));
              } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childElement = child as Element;
                if (
                  childElement.tagName.toLowerCase() === 'strong' ||
                  childElement.tagName.toLowerCase() === 'b'
                ) {
                  paragraphChildren.push(
                    new TextRun({ text: childElement.textContent || '', size: 24, bold: true })
                  );
                } else if (
                  childElement.tagName.toLowerCase() === 'em' ||
                  childElement.tagName.toLowerCase() === 'i'
                ) {
                  paragraphChildren.push(
                    new TextRun({ text: childElement.textContent || '', size: 24, italics: true })
                  );
                } else {
                  paragraphChildren.push(
                    new TextRun({ text: childElement.textContent || '', size: 24 })
                  );
                }
              }
            });
            elements.push(
              new Paragraph({
                children: paragraphChildren,
                spacing: { after: 200 },
              })
            );
            break;
          case 'table':
            // Handle table conversion
            const tableRows: any[] = [];
            const tableElement = element as HTMLTableElement;
            const rows = tableElement.rows;

            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              const cells: any[] = [];

              for (let j = 0; j < row.cells.length; j++) {
                const cell = row.cells[j];
                cells.push(
                  new DocxTableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: cell.textContent || '', size: 24 })],
                      }),
                    ],
                  })
                );
              }

              tableRows.push(
                new DocxTableRow({
                  children: cells,
                })
              );
            }

            if (tableRows.length > 0) {
              elements.push(
                new DocxTable({
                  rows: tableRows,
                  width: { size: 100, type: 'pct' },
                })
              );
            }
            break;
          default:
            // For other elements, process their children
            element.childNodes.forEach((child) => processNode(child));
            break;
        }
      }
    };

    tempDiv.childNodes.forEach((child) => processNode(child));
    return elements;
  };

  const handleImportDocx = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Please select a valid .docx file.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Convert DOCX to HTML using mammoth with table support
      const result = await mammoth.convertToHtml({
        arrayBuffer: arrayBuffer,
      });
      const htmlContent = result.value;

      // Set the HTML content in the editor
      if (editor) {
        editor.commands.setContent(htmlContent);
      }

      console.log('DOCX file imported successfully');
      console.log('HTML content:', htmlContent);
      alert('DOCX file imported successfully!');
    } catch (error) {
      console.error('Error importing DOCX file:', error);
      alert('Error importing DOCX file. Please check the file and try again.');
    } finally {
      // Clear the file input
      event.target.value = '';
    }
  };

  // 2. Updated Toolbar to match the screenshot style
  const Toolbar = () => {
    if (!editor) return null;

    const activeClass = 'text-white bg-zinc-800';
    const inactiveClass = 'text-zinc-400 hover:text-white hover:bg-zinc-800';
    const btnClass = 'p-1.5 rounded-md transition-colors';

    return (
      <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-950 text-zinc-400 border-b border-zinc-800 sticky top-0 z-10">
        {/* History Group */}
        <div className="flex items-center space-x-1 pr-2 border-r border-zinc-800">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={btnClass}
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={btnClass}
          >
            <Redo2 size={18} />
          </button>
        </div>

        {/* Headings Group */}
        <div className="flex items-center space-x-1 px-2 border-r border-zinc-800">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${btnClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : inactiveClass}`}
          >
            <Heading1 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${btnClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : inactiveClass}`}
          >
            <Heading2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`${btnClass} ${editor.isActive('paragraph') ? activeClass : inactiveClass}`}
          >
            <Type size={18} />
          </button>
        </div>

        {/* Lists Group */}
        <div className="flex items-center space-x-1 px-2 border-r border-zinc-800">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${btnClass} ${editor.isActive('bulletList') ? activeClass : inactiveClass}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${btnClass} ${editor.isActive('orderedList') ? activeClass : inactiveClass}`}
          >
            <ListOrdered size={18} />
          </button>
        </div>

        {/* Formatting Group */}
        <div className="flex items-center space-x-1 px-2 border-r border-zinc-800">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${btnClass} ${editor.isActive('bold') ? activeClass : inactiveClass}`}
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${btnClass} ${editor.isActive('italic') ? activeClass : inactiveClass}`}
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${btnClass} ${editor.isActive('strike') ? activeClass : inactiveClass}`}
          >
            <Strikethrough size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`${btnClass} ${editor.isActive('code') ? activeClass : inactiveClass}`}
          >
            <Code size={18} />
          </button>
        </div>

        {/* Utils Group */}
        <div className="flex items-center space-x-1 px-2">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${btnClass} ${editor.isActive('blockquote') ? activeClass : inactiveClass}`}
          >
            <Quote size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={btnClass}
          >
            <Minus size={18} />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            className={btnClass}
          >
            <TableIcon size={18} />
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => document.getElementById('docx-import')?.click()}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 text-zinc-400 hover:text-white transition-colors">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DMS Editor</h1>
          <p className="text-zinc-500 mt-1">Professional document creation with Tiptap & DOCX</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-white overflow-hidden shadow-2xl">
        <Toolbar />
        <div className="min-h-[600px] p-8 bg-white">
          {/* Custom styles for the editor content */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .tiptap { outline: none !important; color: #1f2937; }
            .tiptap h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1.5rem; color: #111827; }
            .tiptap h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
            .tiptap p { margin-bottom: 1rem; line-height: 1.6; color: #374151; }
            .tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #374151; }
            .tiptap blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; font-style: italic; color: #6b7280; }
            .tiptap table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
            .tiptap table td, .tiptap table th { border: 1px solid #d1d5db; padding: 0.5rem; vertical-align: top; }
            .tiptap table th { background-color: #f9fafb; font-weight: 600; }
            .tiptap table tr:nth-child(even) { background-color: #f9fafb; }
          `,
            }}
          />
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Hidden file input for DOCX import */}
      <input
        type="file"
        accept=".docx"
        onChange={handleImportDocx}
        className="hidden"
        id="docx-import"
      />
    </div>
  );
}
