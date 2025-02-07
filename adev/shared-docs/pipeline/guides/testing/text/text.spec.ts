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
    const markdownContent = await readFile(runfiles.resolvePackageRelative('text/text.md'), {
      encoding: 'utf-8',
    });
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('should wrap emoji in custom classes', () => {
    const emoji = markdownDocument.querySelector('span.docs-emoji');
    expect(emoji).toBeTruthy();
    expect(emoji?.textContent).toContain('😎');
  });

  it('should not apply a custom class if no emoji is present', () => {
    const [, noemoji] = markdownDocument.querySelectorAll('p');
    expect(noemoji).toBeTruthy();
    expect(noemoji?.textContent).not.toContain('😎');
  });
});
