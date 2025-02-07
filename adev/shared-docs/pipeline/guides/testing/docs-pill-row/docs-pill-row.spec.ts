/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseMarkdown} from '../../../guides/parse';
import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(
      runfiles.resolvePackageRelative('docs-pill-row/docs-pill-row.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('should create a nav container with all of the docs pills inside', () => {
    const navEl = markdownDocument.querySelector('nav');
    expect(navEl?.children.length).toBe(2);
    expect(navEl?.classList.contains('docs-pill-row')).toBeTrue();
  });
});
