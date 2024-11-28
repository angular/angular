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
    const markdownContent = await readFile(runfiles.resolvePackageRelative('./mermaid.md'), {
      encoding: 'utf-8',
    });

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
