/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseMarkdown} from '../../../guides/parse.mjs';
import {resolve} from 'node:path';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(resolve('./docs-decorative-header.md'), {
      encoding: 'utf-8',
    });
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('sets the custom title in the header', () => {
    expect(markdownDocument.querySelector('h1')?.textContent).toBe('Custom Title');
  });

  it('includes provided svgs', () => {
    expect(markdownDocument.querySelector('svg')).toBeTruthy();
  });

  it('passes the header text to the content', () => {
    expect(markdownDocument.querySelector('p')?.textContent?.trim()).toBe('This is header text');
  });
});
