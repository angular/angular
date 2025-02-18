/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {docsCodeBlockExtension} from '../../extensions/docs-code/docs-code-block';
import {walkTokens} from '../../walk-tokens';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    // Extend the timeout interval tyo 15 seconds because we were seeing issues with not being able to run marked
    // within the default timeframe.
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

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

    marked.use({
      async: true,
      extensions: [docsCodeBlockExtension],
      walkTokens,
    });
    markdownDocument = JSDOM.fragment(await marked.parse(markdownContent));
  });

  it('should create an svg for each mermaid code block', () => {
    const svgs = markdownDocument.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
  });
});
