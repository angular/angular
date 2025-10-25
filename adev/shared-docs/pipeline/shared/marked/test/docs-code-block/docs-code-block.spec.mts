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
import {rendererContext, setHighlighter} from '../renderer-context.mjs';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    await setHighlighter();
    const markdownContent = await readFile(resolve('./docs-code-block.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it('converts triple ticks into a code block', () => {
    const codeBlock = markdownDocument.querySelector('code');
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).toBe('this is a code block');
  });
});
