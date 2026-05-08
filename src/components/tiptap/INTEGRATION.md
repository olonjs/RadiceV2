# Tiptap Editorial — Integration Guide

How to add the `tiptap` section to a new tenant.

---

## 1. Copy the component

Copy the entire folder into the new tenant:

```
src/components/tiptap/
  index.ts
  types.ts
  View.tsx
```

---

## 2. Install npm dependencies

Add to the tenant's `package.json` and run `npm install`:

```json
"@tiptap/extension-image": "^2.11.5",
"@tiptap/extension-link": "^2.11.5",
"@tiptap/react": "^2.11.5",
"@tiptap/starter-kit": "^2.11.5",
"react-markdown": "^9.0.1",
"rehype-sanitize": "^6.0.0",
"remark-gfm": "^4.0.1",
"tiptap-markdown": "^0.8.10"
```

---

## 3. Add CSS to `src/index.css`

Two blocks are required — one for the public (visitor) view, one for the editor (studio) view.

```css
/* ==========================================================================
   TIPTAP — Public content typography (visitor view)
   ========================================================================== */
.jp-tiptap-content > * + * { margin-top: 0.75em; }

.jp-tiptap-content h1 { font-size: 2em;    font-weight: 700; line-height: 1.2; margin-top: 1.25em; margin-bottom: 0.25em; }
.jp-tiptap-content h2 { font-size: 1.5em;  font-weight: 700; line-height: 1.3; margin-top: 1.25em; margin-bottom: 0.25em; }
.jp-tiptap-content h3 { font-size: 1.25em; font-weight: 600; line-height: 1.4; margin-top: 1.25em; margin-bottom: 0.25em; }
.jp-tiptap-content h4 { font-size: 1em;    font-weight: 600; line-height: 1.5; margin-top: 1em;    margin-bottom: 0.25em; }

.jp-tiptap-content p  { line-height: 1.7; }
.jp-tiptap-content strong { font-weight: 700; }
.jp-tiptap-content em     { font-style: italic; }
.jp-tiptap-content s      { text-decoration: line-through; }

.jp-tiptap-content a { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }
.jp-tiptap-content a:hover { opacity: 0.8; }

.jp-tiptap-content code {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.875em;
  background: color-mix(in oklch, var(--foreground) 8%, transparent);
  border-radius: 0.25em;
  padding: 0.1em 0.35em;
}
.jp-tiptap-content pre {
  background: color-mix(in oklch, var(--background) 60%, black);
  border-radius: 0.5em;
  padding: 1em 1.25em;
  overflow-x: auto;
}
.jp-tiptap-content pre code { background: none; padding: 0; }

.jp-tiptap-content ul { list-style-type: disc;    padding-left: 1.625em; }
.jp-tiptap-content ol { list-style-type: decimal; padding-left: 1.625em; }
.jp-tiptap-content li { line-height: 1.7; margin-top: 0.25em; }
.jp-tiptap-content li + li { margin-top: 0.25em; }

.jp-tiptap-content blockquote {
  border-left: 3px solid var(--border);
  padding-left: 1em;
  color: var(--muted-foreground);
  font-style: italic;
}
.jp-tiptap-content hr { border: none; border-top: 1px solid var(--border); margin: 1.5em 0; }
.jp-tiptap-content img { max-width: 100%; height: auto; border-radius: 0.5rem; }

/* ==========================================================================
   TIPTAP / PROSEMIRROR — Editor typography (studio view)
   ========================================================================== */
.jp-simple-editor .ProseMirror { outline: none; word-break: break-word; }
.jp-simple-editor .ProseMirror > * + * { margin-top: 0.75em; }

.jp-simple-editor .ProseMirror h1 { font-size: 2em;    font-weight: 700; line-height: 1.2; margin-top: 1.25em; margin-bottom: 0.25em; }
.jp-simple-editor .ProseMirror h2 { font-size: 1.5em;  font-weight: 700; line-height: 1.3; margin-top: 1.25em; margin-bottom: 0.25em; }
.jp-simple-editor .ProseMirror h3 { font-size: 1.25em; font-weight: 600; line-height: 1.4; margin-top: 1.25em; margin-bottom: 0.25em; }
.jp-simple-editor .ProseMirror h4 { font-size: 1em;    font-weight: 600; line-height: 1.5; margin-top: 1em;    margin-bottom: 0.25em; }

.jp-simple-editor .ProseMirror p  { line-height: 1.7; }
.jp-simple-editor .ProseMirror strong { font-weight: 700; }
.jp-simple-editor .ProseMirror em     { font-style: italic; }
.jp-simple-editor .ProseMirror s      { text-decoration: line-through; }

.jp-simple-editor .ProseMirror a { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }
.jp-simple-editor .ProseMirror a:hover { opacity: 0.8; }

.jp-simple-editor .ProseMirror code {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.875em;
  background: color-mix(in oklch, var(--foreground) 8%, transparent);
  border-radius: 0.25em;
  padding: 0.1em 0.35em;
}
.jp-simple-editor .ProseMirror pre {
  background: color-mix(in oklch, var(--background) 60%, black);
  border-radius: 0.5em;
  padding: 1em 1.25em;
  overflow-x: auto;
}
.jp-simple-editor .ProseMirror pre code { background: none; padding: 0; }

.jp-simple-editor .ProseMirror ul { list-style-type: disc;    padding-left: 1.625em; }
.jp-simple-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.625em; }
.jp-simple-editor .ProseMirror li { line-height: 1.7; margin-top: 0.25em; }
.jp-simple-editor .ProseMirror li + li { margin-top: 0.25em; }

.jp-simple-editor .ProseMirror blockquote {
  border-left: 3px solid var(--border);
  padding-left: 1em;
  color: var(--muted-foreground);
  font-style: italic;
}
.jp-simple-editor .ProseMirror hr { border: none; border-top: 1px solid var(--border); margin: 1.5em 0; }

.jp-simple-editor .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5rem; }
.jp-simple-editor .ProseMirror img[data-uploading="true"] {
  opacity: 0.6;
  filter: grayscale(0.25);
  outline: 2px dashed rgb(59 130 246 / 0.7);
  outline-offset: 2px;
}
.jp-simple-editor .ProseMirror img[data-upload-error="true"] {
  outline: 2px solid rgb(239 68 68 / 0.8);
  outline-offset: 2px;
}
.jp-simple-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--muted-foreground);
  opacity: 0.5;
  pointer-events: none;
  float: left;
  height: 0;
}
```

---

## 4. Register in `src/lib/schemas.ts`

```ts
import { TiptapSchema } from '@/components/tiptap';

export const SECTION_SCHEMAS = {
  // ... existing schemas
  'tiptap': TiptapSchema,
} as const;
```

---

## 5. Register in `src/lib/addSectionConfig.ts`

```ts
const addableSectionTypes = [
  // ... existing types
  'tiptap',
] as const;

const sectionTypeLabels = {
  // ... existing labels
  'tiptap': 'Tiptap Editorial',
};

function getDefaultSectionData(type: string) {
  switch (type) {
    // ... existing cases
    case 'tiptap': return { content: '# Post title\n\nStart writing in Markdown...' };
  }
}
```

---

## 6. Register in `src/lib/ComponentRegistry.tsx`

```tsx
import { Tiptap } from '@/components/tiptap';

export const ComponentRegistry = {
  // ... existing components
  'tiptap': Tiptap,
};
```

---

## 7. Register in `src/types.ts`

```ts
import type { TiptapData, TiptapSettings } from '@/components/tiptap';

export type SectionComponentPropsMap = {
  // ... existing entries
  'tiptap': { data: TiptapData; settings?: TiptapSettings };
};

declare module '@jsonpages/core' {
  export interface SectionDataRegistry {
    // ... existing entries
    'tiptap': TiptapData;
  }
  export interface SectionSettingsRegistry {
    // ... existing entries
    'tiptap': TiptapSettings;
  }
}
```

---

## Notes

- Typography uses tenant CSS variables (`--primary`, `--border`, `--muted-foreground`, `--font-mono`) — no hardcoded colors.
- `@tailwindcss/typography` is **not** required; the CSS blocks above replace it.
- The toolbar is admin-only (studio mode). In visitor mode, content is rendered via `ReactMarkdown`.
- Underline is intentionally excluded: `tiptap-markdown` with `html: false` cannot round-trip `<u>` tags.

