import {EditorView, ViewPlugin, Decoration, DecorationSet} from '@codemirror/view';
import {RangeSetBuilder} from '@codemirror/state';
import {createHighlighter} from 'shiki';

const LIGHT_THEME = 'github-light';
const DARK_THEME = 'github-dark';

export async function initHighlighter(): Promise<any> {
  return await createHighlighter({
    themes: [LIGHT_THEME, DARK_THEME],
    langs: [
      'javascript',
      'typescript',
      'angular-html',
      'angular-ts',
      'shell',
      'html',
      'http',
      'json',
      'jsonc',
      'nginx',
      'markdown',
      'apache',
    ],
  });
}

// ShikiHighlighter plugin factory
export async function shikiHighlighter() {
  const highlighter = await initHighlighter();

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = this.highlight(view);
      }

      update(update: {docChanged: boolean; viewportChanged: boolean; view: EditorView}) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.highlight(update.view);
        }
      }

      highlight(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder();

        for (let {from, to} of view.visibleRanges) {
          const text = view.state.doc.sliceString(from, to);

          // Let Shiki highlight this chunk
          const tokens = highlighter.codeToThemedTokens(text, 'angular-ts');

          let pos = from;
          for (let line of tokens) {
            for (let token of line) {
              const deco = Decoration.mark({
                style: `color: ${token.color}`,
              });
              const end = pos + token.content.length;
              builder.add(pos, end, deco);
              pos = end;
            }
            pos++; // account for newline
          }
        }

        return builder.finish() as DecorationSet;
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );
}
