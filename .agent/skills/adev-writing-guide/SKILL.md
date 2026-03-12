---
name: adev-writing-guide
description: Comprehensive writing guide for Angular documentation (adev). Covers Google Technical Writing standards, Angular-specific markdown extensions, code blocks, and components. Use when authoring or reviewing content in adev/src/content.
---

# Angular Documentation (adev) Writing Guide

This skill provides comprehensive guidelines for authoring content in `adev/src/content`. It combines Google's technical writing standards with Angular-specific markdown conventions, components, and best practices.

## I. Google Technical Writing Guidelines

### Tone and Content

- **Be conversational and friendly:** Maintain a helpful yet professional tone. Avoid being overly casual.
- **Write accessibly:** Ensure documentation is understandable to a diverse global audience, including non-native English speakers.
- **Audience-first:** Focus on what the user needs to do, not just what the system does.
- **Avoid pre-announcing:** Do not mention unreleased features or make unsupported claims.
- **Use descriptive link text:** Link text should clearly indicate the destination (e.g., avoid "click here").

### Language and Grammar

- **Use second person ("you"):** Address the reader directly.
- **Prefer active voice:** Clearly state who or what is performing the action (e.g., "The system generates a token" vs "A token is generated").
- **Standard American English:** Use standard American spelling and punctuation.
- **Conditional clauses first:** Place "if" or "when" clauses before the instruction (e.g., "If you encounter an error, check the logs").
- **Define terms:** Introduce new or unfamiliar terms/acronyms upon first use.
- **Consistent terminology:** Use the same term for the same concept throughout the document.
- **Conciseness:** Aim for one idea per sentence. Keep sentences short.

### Formatting and Organization

- **Sentence case for headings:** Capitalize only the first word and proper nouns in titles and headings.
- **Lists:**
  - **Numbered lists:** Use for sequential steps or prioritized items.
  - **Bulleted lists:** Use for unordered collections of items.
  - **Description lists:** Use for term-definition pairs.
- **Serial commas:** Use the Oxford comma (comma before the last item in a list of three or more).
- **Code formatting:** Use code font for code-related text (filenames, variables, commands).
- **UI Elements:** formatting user interface elements in **bold**.
- **Date formatting:** Use unambiguous formats (e.g., "September 4, 2024" rather than "9/4/2024").
- **Structure:** Use logical hierarchy with clear introductions and navigation. Headings should be task-based where possible.

### Images and Code Samples

- **Images:** Use simple, clear illustrations to enhance understanding.
- **Captions:** Write captions that support the image.
- **Code Samples:**
  - Ensure code is correct and builds without errors.
  - Follow language-specific conventions.
  - **Comments:** Focus on _why_, not _what_. Avoid commenting on obvious code.

### Reference Hierarchy

1.  Project-specific style guidelines (if any exist in `CONTRIBUTING.md` or similar).
2.  Google Developer Documentation Style Guide.
3.  Merriam-Webster (spelling).
4.  Chicago Manual of Style (non-technical).
5.  Microsoft Writing Style Guide (technical).

---

## II. Angular Documentation Specifics

### Code Blocks

Use the appropriate language identifier for syntax highlighting:

- **TypeScript (Angular):** Use `angular-ts` when TypeScript code examples contain inline templates.
- **HTML (Angular):** Use `angular-html` for Angular templates.
- **TypeScript (Generic):** Use `ts` for plain TypeScript.
- **HTML (Generic):** Use `html` for plain HTML.
- **Shell/Terminal:** Use `shell` or `bash`.
- **Mermaid Diagrams:** Use `mermaid`.

#### Attributes

You can enhance code blocks with attributes in curly braces `{}` after the language identifier:

- `header="Title"`: Adds a title to the code block.
- `linenums`: Enables line numbering.
- `highlight="[1, 3-5]"`: Highlights specific lines.
- `hideCopy`: Hides the copy button.
- `prefer`: Marks code as a preferred example (green border/check).
- `avoid`: Marks code as an example to avoid (red border/cross).

**Example:**

````markdown
```angular-ts {header:"My Component", linenums, highlight="[2]"}
@Component({
  selector: 'my-app',
  template: '<h1>Hello</h1>',
})
export class App {}
```
````

#### `<docs-code>` Component

For more advanced code block features, use the `<docs-code>` component:

- `path`: Path to a source file (e.g., `adev/src/content/examples/...`).
- `header`: Custom header text.
- `language`: Language identifier (e.g., `angular-ts`).
- `linenums`: Boolean attribute.
- `highlight`: Array of line numbers/ranges (e.g., `[[3,7], 9]`).
- `diff`: Path to diff file.
- `visibleLines`: Range of lines to show initially (collapsible).
- `region`: Region to extract from source file.
- `preview`: Boolean. Renders a live preview (StackBlitz). _Only works with standalone examples._
- `hideCode`: Boolean. Collapses code by default.

**Multifile Example:**

```html
<docs-code-multifile path="..." preview>
  <docs-code path="..." />
  <docs-code path="..." />
</docs-code-multifile>
```

### Alerts / Admonitions

Use specific keywords followed by a colon for alerts. These render as styled blocks.

- `NOTE:` For ancillary information.
- `TIP:` For helpful hints or shortcuts.
- `IMPORTANT:` For crucial information.
- `CRITICAL:` For warnings about potential data loss or severe issues.
- `TODO`: For incomplete documentation.
- `QUESTION:` To pose a question to the reader.
- `SUMMARY:` For section summaries.
- `TLDR:` For concise summaries.
- `HELPFUL:` For best practices.

**Example:**

```markdown
TIP: Use `ng serve` to run your application locally.
```

### Custom Components

- **Cards (`<docs-card>`):**
  - Must be inside `<docs-card-container>`.
  - Attributes: `title`, `link`, `href`.
- **Callouts (`<docs-callout>`):**
  - Attributes: `title`, `important`, `critical`.
- **Pills (`<docs-pill>`):**
  - Must be inside `<docs-pill-row>`.
  - Attributes: `title`, `href`.
- **Steps / Workflow (`<docs-step>`):**
  - Must be inside `<docs-workflow>`.
  - Attributes: `title`.
- **Tabs (`<docs-tab>`):**
  - Must be inside `<docs-tab-group>`.
  - Attributes: `label`.
- **Videos (`<docs-video>`):**
  - Attributes: `src` (YouTube embed URL), `alt`.

### Images

Use standard markdown syntax with optional attributes for sizing and loading behavior.

- `#small`, `#medium`: Append to image URL for sizing.
- `{loading: 'lazy'}`: Add attribute for lazy loading.

**Example:**

```markdown
![Alt Text](path/to/image.png#medium {loading: 'lazy'})
```

### Headers

- Use markdown headers (`#`, `##`, `###`).
- Ensure a logical hierarchy (don't skip levels).
- `h2` and `h3` are most common for content structure.
