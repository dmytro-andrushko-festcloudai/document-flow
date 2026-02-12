# Document Flow App - AI Agent Instructions

## Project Purpose

This is a research demonstration application for document management systems, showcasing different approaches to document templating and generation. Each page demonstrates a unique library or methodology for creating, editing, and live-previewing documents with templating capabilities.

## Architecture Overview

This is a React + TypeScript + Vite application for document template processing research. The app demonstrates different document generation approaches across four pages, each representing a distinct research finding or library evaluation:

- **Page 1**: PDF generation using `@react-pdf/renderer` (declarative React components)
- **Page 2**: PDF forms using `@pdfme/ui` (drag-and-drop designer with schemas)
- **Page 3**: DOCX templating using `docxtemplater` (traditional template replacement)
- **Page 4**: DOCX templating using `docx-templates` (JavaScript execution in templates)

## Key Patterns & Conventions

### Document Processing Architecture

- Each page implements a different document library with consistent form inputs
- Form data flows: User Input → State → Template Processing → Preview/Download
- File uploads use `FileReader.readAsArrayBuffer()` → `Uint8Array` for template buffers
- Preview rendering uses library-specific async methods (`renderAsync`, `Form`, etc.)

### Page Structure Requirements

Each page must include:

- **Title section**: Display main library/libraries being demonstrated
- **Input blocks**: Few fields with default values (company/client info) that appear in generated documents
- **Upload button**: For template file selection
- **Download button**: For generated document download
- **Preview block**: Live document preview
- **Extra functionality**: Library-specific features (designer, additional options)

### State Management & Persistence

- Form data auto-saves to `localStorage` every 2 seconds after user stops typing
- Initial state loaded from localStorage on mount (avoids setState in useEffect)
- State structure: `{companyName, companyAddress, companyPhoneNumber, clientCompanyName, clientAddress, clientPhoneNumber}`

### UI Component System

- Uses shadcn/ui components (`Input`, `Textarea`, `Button`) with Tailwind CSS v4
- Components imported via `@/components/ui/*` alias
- Inline styles mixed with Tailwind classes for layout

### File Handling Patterns

```typescript
// Template loading
const arrayBuffer = await file.arrayBuffer();
const uint8Array = new Uint8Array(arrayBuffer);

// Blob creation for downloads
const blob = new Blob([buffer], {
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
});
```

### Build & Development

- Vite with TypeScript project references (`tsconfig.app.json`, `tsconfig.node.json`)
- Node polyfills required for browser compatibility (`vite-plugin-node-polyfills`)
- Tailwind v4 with PostCSS plugin (`@tailwindcss/postcss`)
- Build command: `npm run build` (includes TypeScript compilation)

### Library-Specific Configurations

- **docx-templates**: Always use `noSandbox: true` for browser compatibility
- **docxtemplater**: Uses `delimiters: { start: '{', end: '}' }` and `PizZip` for ZIP handling
- **@pdfme/ui**: Requires schema definitions and plugin imports (`text`, `image`, `barcodes`)

## Critical Workflows

### Adding New Research Pages

1. Create new page component in `src/pages/pageX/`
2. Add local components in `src/pages/pageX/components/`
3. Implement required page structure: title, inputs, upload, download, preview, extra features
4. Implement form state with auto-save pattern
5. Add file upload handler with ArrayBuffer processing
6. Configure library-specific template processing
7. Add preview component with async rendering

### Component Development

- Use shadcn/ui components from `@/components/ui/*`
- Follow existing form patterns with label/input structure
- Implement disabled states based on data availability
- Use refs for DOM manipulation in preview components
- Keep page-specific components in `pageX/components/` folder

### Debugging Document Generation

- Check browser console for template processing errors
- Verify file upload produces valid ArrayBuffer/Uint8Array
- Ensure template delimiters match library expectations
- Test with simple data first, then complex templates

## File Structure Reference

- `src/pages/page*/`: Page-specific components and logic
- `src/pages/page*/components/`: Local components for each page
- `src/components/ui/`: shadcn/ui components
- `src/lib/utils.ts`: Utility functions (cn, etc.)
- `vite.config.ts`: Build configuration with aliases and polyfills
- `tsconfig.*.json`: TypeScript project references</content>
  <parameter name="filePath">/Users/dmytroandrushko/fest/test222222/document-flow-app/.github/copilot-instructions.md
