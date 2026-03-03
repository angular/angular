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
    const markdownContent = await readFile(resolve('./docs-code.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it('converts docs-code elements into a code block', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[0];
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).toBe('this is code');
  });

  it('removes eslint comments from the code', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[1];
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).not.toContain('// eslint');
  });

  it('extract regions from the code', () => {
    // This unit test is sensible to additional node, like text nodes between the lines.
    // The specific index here makes sure there is no space/linebreak between the code lines
    const codeBlock = markdownDocument.querySelectorAll('code')[2];
    expect(codeBlock).toBeTruthy();

    expect(codeBlock?.textContent?.trim()).toContain(`const x = 'within the region';`);
    expect(codeBlock?.textContent?.trim()).not.toContain('docregion');
  });

  it('should load header and html code', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[3];
    expect(codeBlock).toBeTruthy();
  });

  it('should not link property names in object literals', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[4];
    expect(codeBlock?.innerHTML).not.toContain('<a href="/api/animations/state">state</a>');
  });

  it('should parse the hideDollar attribute', () => {
    const codeBlock = markdownDocument.querySelectorAll('.docs-code')[5];
    expect(codeBlock.getAttribute('hideDollar')).toBe('true');
  });
});
