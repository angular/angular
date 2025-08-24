/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseMarkdown} from '../../parse.mjs';
import {resolve} from 'node:path';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {initHighlighter} from '../../extensions/docs-code/format/highlight.mjs';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    await initHighlighter();
    const markdownContent = await readFile(resolve('./docs-code-multifile.md'), {
      encoding: 'utf-8',
    });
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('converts triple ticks into a code block', () => {
    const multiFileEl = markdownDocument.querySelector('.docs-code-multifile');
    expect(multiFileEl).toBeTruthy();

    const codeBlockOne = multiFileEl!.children[0]!;
    expect(codeBlockOne).toBeTruthy();
    expect(codeBlockOne?.textContent?.trim()).toBe('this is code');

    const codeBlockTwo = multiFileEl!.children[1]!;
    expect(codeBlockTwo).toBeTruthy();
    expect(codeBlockTwo?.textContent?.trim()).toBe('this is also code');
  });
});
