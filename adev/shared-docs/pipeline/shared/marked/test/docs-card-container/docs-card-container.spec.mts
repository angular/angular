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
import {rendererContext} from '../renderer-context.mjs';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(resolve('docs-card-container.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it('creates card containers containing multiple cards', () => {
    const containerEl = markdownDocument.querySelector('.docs-card-grid');

    expect(containerEl!.children.length).toBe(2);
    expect(containerEl!.classList.contains('docs-card-grid')).toBeTrue();
  });
});
