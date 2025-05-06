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
    const markdownContent = await readFile(
      runfiles.resolvePackageRelative('docs-card-container/docs-card-container.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('creates card containers containing multiple cards', () => {
    const containerEl = markdownDocument.querySelector('.docs-card-grid');

    expect(containerEl!.children.length).toBe(2);
    expect(containerEl!.classList.contains('docs-card-grid')).toBeTrue();
  });
});
