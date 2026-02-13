import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Editor from '@hufe921/canvas-editor';
import docxPlugin from '@hufe921/canvas-editor-plugin-docx';

// Extend window interface for our custom property
declare global {
  interface Window {
    updateToolbarState?: () => void;
  }
}

export default function Docx4() {
  const canvasRef = useRef<HTMLDivElement>(null);
  // 💡 Use a Ref to store the editor instance so it persists without re-renders
  const canvasEditorRef = useRef<any>(null);

  useEffect(() => {
    // Only initialize once
    if (canvasRef.current && !canvasEditorRef.current) {
      try {
        // Initialize canvas editor for DOCX editing
        const editor = new Editor(
          canvasRef.current,
          [
            {
              value: 'Welcome to DOCX Editor',
              size: 28,
              bold: true,
              color: '#2c3e50',
            },
            {
              value: '\n',
            },
            {
              value: 'This is a canvas-based document editor with toolbar functionality.',
              size: 16,
              color: '#34495e',
            },
            {
              value: '\n',
            },
            {
              value: 'You can add text, shapes, and format your document.',
              size: 14,
              color: '#7f8c8d',
            },
            {
              value: '\n\n',
            },
            {
              value: 'Start typing to create your document...',
              size: 12,
              italic: true,
              color: '#95a5a6',
            },
          ],
          {}
        );

        // Register DOCX plugin
        editor.use(docxPlugin);

        canvasEditorRef.current = editor;

        // Add event listeners for selection changes
        const canvasContainer = canvasRef.current;
        if (canvasContainer) {
          const handleSelectionChange = () => {
            if ((window as any).updateToolbarState) {
              (window as any).updateToolbarState();
            }
          };

          canvasContainer.addEventListener('mouseup', handleSelectionChange);
          canvasContainer.addEventListener('keyup', handleSelectionChange);
          canvasContainer.addEventListener('click', handleSelectionChange);

          // Store the listeners for cleanup
          (canvasContainer as any)._selectionListeners = [handleSelectionChange];
        }
      } catch (error) {
        console.error('Failed to initialize canvas editor:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (canvasEditorRef.current) {
        // Remove event listeners
        const canvasContainer = canvasRef.current;
        if (canvasContainer && (canvasContainer as any)._selectionListeners) {
          (canvasContainer as any)._selectionListeners.forEach((listener: any) => {
            canvasContainer.removeEventListener('mouseup', listener);
            canvasContainer.removeEventListener('keyup', listener);
            canvasContainer.removeEventListener('click', listener);
          });
        }

        canvasEditorRef.current.destroy();
        canvasEditorRef.current = null;
      }
    };
  }, []);

  // 💡 This function safely calls the editor commands
  const handleCommand = (name: string, value?: any, options?: any) => {
    if (canvasEditorRef.current?.command) {
      try {
        const command = canvasEditorRef.current.command[name];
        if (typeof command === 'function') {
          if (options) {
            command.call(canvasEditorRef.current.command, value, options);
          } else if (value !== undefined) {
            command.call(canvasEditorRef.current.command, value);
          } else {
            command.call(canvasEditorRef.current.command);
          }
          // Update toolbar state after command execution
          setTimeout(() => {
            // This will be called from within the Toolbar component
            if (window.updateToolbarState) {
              window.updateToolbarState();
            }
          }, 10);
        } else {
          console.warn(`Command ${name} not found on canvas editor`);
        }
      } catch (error) {
        console.error(`Error executing command ${name}:`, error);
      }
    } else {
      console.warn('Canvas editor not initialized');
    }
  };

  const handleDownload = async () => {
    if (canvasEditorRef.current) {
      try {
        // Get the document data
        const { data } = canvasEditorRef.current.command.getValue();
        console.log('Document data:', data);

        // Export as image
        const images = await canvasEditorRef.current.command.getImage();
        if (images && images.length > 0) {
          const link = document.createElement('a');
          link.download = 'document.png';
          link.href = images[0];
          link.click();
        }
      } catch (error) {
        console.error('Error exporting document:', error);
        alert('Error exporting document. Please try again.');
      }
    }
  };

  const handleImportDocx = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Please select a valid .docx file.');
      return;
    }

    // Show loading state
    const importButton = document.querySelector('label[for="docx-import"]') as HTMLElement;
    if (importButton) {
      importButton.textContent = 'Importing...';
      importButton.style.pointerEvents = 'none';
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Use the native DOCX plugin to import the file
      if (canvasEditorRef.current?.command) {
        canvasEditorRef.current.command.executeImportDocx({
          arrayBuffer: arrayBuffer,
        });

        // Update toolbar state after loading
        setTimeout(() => {
          if ((window as any).updateToolbarState) {
            (window as any).updateToolbarState();
          }
        }, 100);

        console.log('DOCX file imported successfully');
        alert('DOCX file imported successfully!');
      } else {
        throw new Error('Canvas editor not initialized');
      }
    } catch (error) {
      console.error('Error importing DOCX file:', error);
      alert('Error importing DOCX file. Please check the file and try again.');
    } finally {
      // Reset button state
      if (importButton) {
        importButton.textContent = 'Import DOCX File';
        importButton.style.pointerEvents = 'auto';
      }
      // Clear the file input
      event.target.value = '';
    }
  };

  const Toolbar = () => {
    const [fontSize, setFontSize] = useState(16);
    const [textColor, setTextColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffff00');
    const [currentFormatting, setCurrentFormatting] = useState({
      bold: false,
      italic: false,
      underline: false,
      strikeout: false,
      superscript: false,
      subscript: false,
      font: 'Arial',
      size: 16,
      color: '#000000',
      highlight: '#ffff00',
    });

    // Function to get current formatting state and update toolbar
    const updateToolbarState = () => {
      if (canvasEditorRef.current?.command) {
        try {
          const rangeContext = canvasEditorRef.current.command.getRangeContext();
          if (rangeContext) {
            const { startElement } = rangeContext;

            // Update toolbar state based on current selection
            const newFormatting = {
              bold: startElement.bold || false,
              italic: startElement.italic || false,
              underline: startElement.underline || false,
              strikeout: startElement.strikeout || false,
              superscript: startElement.superscript || false,
              subscript: startElement.subscript || false,
              font: startElement.font || 'Arial',
              size: startElement.size || 16,
              color: startElement.color || '#000000',
              highlight: startElement.highlight || '#ffff00',
            };

            setFontSize(newFormatting.size);
            setTextColor(newFormatting.color);
            setBgColor(newFormatting.highlight);
            setCurrentFormatting(newFormatting);

            console.log('Updated toolbar state:', newFormatting);
          }
        } catch (error) {
          console.error('Error updating toolbar state:', error);
        }
      }
    };

    // Make updateToolbarState available globally
    useEffect(() => {
      (window as any).updateToolbarState = updateToolbarState;
      return () => {
        delete (window as any).updateToolbarState;
      };
    }, []);

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const size = parseInt(e.target.value);
      setFontSize(size);
      handleCommand('executeSize', size);
    };

    const handleColorChange = (color: string) => {
      setTextColor(color);
      handleCommand('executeColor', color, { isIgnoreDisabledRule: true });
    };

    const handleBgColorChange = (color: string) => {
      setBgColor(color);
      handleCommand('executeHighlight', color, { isIgnoreDisabledRule: true });
    };

    return (
      <div className="border-b border-gray-200 p-2 bg-white shadow-sm">
        <div className="flex items-center gap-1 flex-wrap">
          {/* History Actions */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeUndo');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Undo (Ctrl+Z)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-9 9" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeRedo');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Redo (Ctrl+Y)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 019 9" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Font Controls */}
          <select
            className="px-2 py-1 border rounded text-sm hover:bg-gray-50 cursor-pointer"
            value={currentFormatting.font}
            onChange={(e) => handleCommand('executeFont', e.target.value)}
            title="Font Family"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>

          <select
            className="px-2 py-1 border rounded text-sm hover:bg-gray-50 cursor-pointer w-16"
            value={fontSize}
            onChange={handleFontSizeChange}
            title="Font Size"
          >
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
            <option value="24">24</option>
            <option value="28">28</option>
            <option value="32">32</option>
          </select>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Text Formatting */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeBold', undefined, { isIgnoreDisabledRule: true });
            }}
            className={`p-1.5 hover:bg-gray-100 rounded font-bold ${
              currentFormatting.bold ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeItalic', undefined, { isIgnoreDisabledRule: true });
            }}
            className={`p-1.5 hover:bg-gray-100 rounded italic ${
              currentFormatting.italic ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeUnderline', undefined, { isIgnoreDisabledRule: true });
            }}
            className={`p-1.5 hover:bg-gray-100 rounded underline ${
              currentFormatting.underline ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            U
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeStrikeout', undefined, { isIgnoreDisabledRule: true });
            }}
            className={`p-1.5 hover:bg-gray-100 rounded line-through ${
              currentFormatting.strikeout ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Strikethrough"
          >
            S
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Superscript/Subscript */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeSuperscript', undefined, { isIgnoreDisabledRule: true });
            }}
            className={`p-1.5 hover:bg-gray-100 rounded text-xs ${
              currentFormatting.superscript ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Superscript"
          >
            x²
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeSubscript', undefined, { isIgnoreDisabledRule: true });
            }}
            className={`p-1.5 hover:bg-gray-100 rounded text-xs ${
              currentFormatting.subscript ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Subscript"
          >
            x₂
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Color Controls */}
          <div className="relative">
            <button
              className="p-1.5 hover:bg-gray-100 rounded flex items-center gap-1"
              title="Text Color"
            >
              <span className="font-bold">A</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-4 h-4 cursor-pointer border-0"
              />
            </button>
          </div>
          <div className="relative">
            <button
              className="p-1.5 hover:bg-gray-100 rounded flex items-center gap-1"
              title="Background Color"
            >
              <span>🎨</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => handleBgColorChange(e.target.value)}
                className="w-4 h-4 cursor-pointer border-0"
              />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Border/Table */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeInsertTable', 3, 3);
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Insert Table"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Alignment */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeRowFlex', 'left');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Align Left"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="15" y2="12" />
              <line x1="3" y1="18" x2="18" y2="18" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeRowFlex', 'center');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Align Center"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeRowFlex', 'right');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Align Right"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="9" y1="12" x2="21" y2="12" />
              <line x1="6" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeRowFlex', 'justify');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Justify"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Line Spacing */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeRowMargin', 20);
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Line Spacing"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Lists */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeList', 'ul');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Bullet List"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="5" cy="6" r="1" fill="currentColor" />
              <circle cx="5" cy="12" r="1" fill="currentColor" />
              <circle cx="5" cy="18" r="1" fill="currentColor" />
              <line x1="9" y1="6" x2="21" y2="6" />
              <line x1="9" y1="12" x2="21" y2="12" />
              <line x1="9" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeList', 'ol');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Numbered List"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <text x="3" y="8" fontSize="8" fill="currentColor">
                1.
              </text>
              <text x="3" y="14" fontSize="8" fill="currentColor">
                2.
              </text>
              <text x="3" y="20" fontSize="8" fill="currentColor">
                3.
              </text>
              <line x1="9" y1="6" x2="21" y2="6" />
              <line x1="9" y1="12" x2="21" y2="12" />
              <line x1="9" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Insert Elements */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeImage', {
                id: Date.now().toString(),
                width: 200,
                height: 150,
                value:
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD48L3N2Zz4=',
                imgDisplay: 'BLOCK',
              });
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Insert Image"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeHyperlink', {
                type: 'hyperlink',
                value: 'Link',
                url: 'https://example.com',
                valueList: [{ value: 'Link' }],
              });
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Insert Link"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executePageBreak');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Page Break"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 2" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Search */}
          <button
            onClick={(e) => {
              e.preventDefault();
              const keyword = prompt('Enter search keyword:');
              if (keyword) handleCommand('executeSearch', keyword);
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1"></div>

          {/* Clear Formatting */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCommand('executeFormat');
            }}
            className="p-1.5 hover:bg-gray-100 rounded text-red-600"
            title="Clear Formatting"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-medium mb-6">@hufe921/canvas-editor</h1>
        <p className="text-muted-foreground" style={{ marginBottom: '16px' }}>
          Canvas-based DOCX document editor with toolbar
        </p>
        <h3 style={{ fontWeight: 'bold', marginBottom: '16px' }}>
          Document editor powered by{'  '}
          <a
            href="https://www.npmjs.com/package/@hufe921/canvas-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <em>@hufe921/canvas-editor</em>
          </a>{' '}
          package
        </h3>
      </div>

      <div className="mb-4 flex gap-2">
        <Button asChild>
          <label htmlFor="docx-import" className="cursor-pointer">
            Import DOCX File
          </label>
        </Button>

        <Button onClick={handleDownload}>Export DOCX file</Button>
        <div className="relative">
          <input
            type="file"
            accept=".docx"
            onChange={handleImportDocx}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="docx-import"
          />
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-4">DOCX Editor Preview</h2>
        <div className="border rounded overflow-hidden">
          <Toolbar />
          <div ref={canvasRef} className="w-full bg-white" style={{ height: '600px' }} />
        </div>
      </div>
    </div>
  );
}
