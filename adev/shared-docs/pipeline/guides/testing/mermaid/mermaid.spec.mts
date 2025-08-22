/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {docsCodeBlockExtension} from '../../extensions/docs-code/docs-code-block.mjs';
import {walkTokens} from '../../walk-tokens.mjs';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    (global as any).HANDLE_MERMAID = true;
    // This test was flaky, 1st attemp to fix it is by inlining the markdown content
    const markdownContent = `
\`\`\`mermaid
    graph TD;
      A-->B;
      A-->C;
      B-->D;
      C-->D;
\`\`\`

\`\`\`mermaid
  pie title Pets adopted by volunteers
      "Dogs" : 386
      "Cats" : 85
      "Rats" : 15
\`\`\`

\`\`\`mermaid
  stateDiagram-v2
    elementInjector: foo
    rootInjector: bar
    nullInjector: baz

    direction BT
    rootInjector --> elementInjector
    elementInjector --> nullInjector
\`\`\`;
    `;

    const markedInstance = marked.use({
      async: true,
      extensions: [docsCodeBlockExtension],
      walkTokens,
    });

    markdownDocument = JSDOM.fragment(await markedInstance.parse(markdownContent));
  }, 15_000);

  it('should create an svg for each mermaid code block', () => {
    expect(markdownDocument.querySelectorAll('svg')).toHaveSize(3);
  });

  describe('stateDiagram-v2', () => {
    // The custom styling is senstive to the generated SVG structure.
    // If one of those test breaks, make sure the styling is stil OK on both the light and dark theme
    it('should have a marker with id mermaid-generated-diagram_stateDiagram-barbEnd', async () => {
      const stateDiagram = markdownDocument.querySelectorAll('svg')[2];
      const marker = stateDiagram.querySelector('#mermaid-generated-diagram_stateDiagram-barbEnd');
      expect(marker).not.toBeNull();
      expect(marker?.tagName).toBe('marker');
    });

    it('should have a structure .statediagram-state > g > path', () => {
      const stateDiagram = markdownDocument.querySelectorAll('svg')[2];
      const path = stateDiagram.querySelector('.statediagram-state > g > path');
      expect(path).not.toBeNull();
      expect(path?.tagName).toBe('path');
    });
  });
});
