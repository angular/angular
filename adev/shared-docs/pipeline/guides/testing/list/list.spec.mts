/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseMarkdown} from '../../../guides/parse.mjs';
import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(runfiles.resolvePackageRelative('list/list.md'), {
      encoding: 'utf-8',
    });
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('should wrap lists in custom classes', () => {
    const orderedList = markdownDocument.querySelector('ol');
    expect(orderedList?.className).toBe('docs-ordered-list');
    expect(orderedList?.childElementCount).toBe(3);
    expect(orderedList?.textContent).toContain('First Item');

    const unorderedList = markdownDocument.querySelector('ul');
    expect(unorderedList?.className).toBe('docs-list');
    expect(unorderedList?.childElementCount).toBe(6);
    expect(unorderedList?.textContent).toContain('matter');
  });

  it('should render list items', () => {
    const unorderedList = markdownDocument.querySelector('ul');
    const linkItem = unorderedList!.children[4];
    expect(linkItem.outerHTML).toContain('href="https://angular.dev"');

    const codeItem = unorderedList!.children[5];
    expect(codeItem.outerHTML).toContain('<code>SomeClass</code>');
  });
});
