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
    `;

    const markedInstance = marked.use({
      async: true,
      extensions: [docsCodeBlockExtension],
      walkTokens,
    });

    markdownDocument = JSDOM.fragment(await markedInstance.parse(markdownContent));
  }, 15_000);

  it('should create an svg for each mermaid code block', () => {
    expect(markdownDocument.querySelectorAll('svg')).toHaveSize(2);
  });
});
