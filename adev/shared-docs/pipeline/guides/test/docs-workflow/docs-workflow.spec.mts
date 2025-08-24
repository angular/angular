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

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(resolve('./docs-workflow.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('create an ordered list container around the docs-steps', () => {
    const docsWorkflowEl = markdownDocument.querySelector('.docs-steps')!;
    expect(docsWorkflowEl.tagName).toBe('OL');
    expect(docsWorkflowEl.children.length).toBe(2);
  });
});
