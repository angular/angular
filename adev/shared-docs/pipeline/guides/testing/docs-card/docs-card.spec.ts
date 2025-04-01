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
      runfiles.resolvePackageRelative('docs-card/docs-card.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('creates cards with no links', () => {
    const cardEl = markdownDocument.querySelectorAll('.docs-card')[0];

    expect(cardEl.querySelector('h3')?.textContent?.trim()).toBe('No Link Card');
    expect(cardEl.tagName).not.toBe('A');
  });

  it('creates cards withs links', () => {
    const cardEl = markdownDocument.querySelectorAll('.docs-card')[1];

    expect(cardEl.querySelector('h3')?.textContent?.trim()).toBe('Link Card');
    expect(cardEl.tagName).toBe('A');

    expect(cardEl.getAttribute('href')).toBe('in/app/link');
  });

  it('creates cards with svg images', () => {
    const cardEl = markdownDocument.querySelectorAll('.docs-card')[2];

    expect(cardEl.querySelector('h3')?.textContent?.trim()).toBe('Image Card');
    expect(cardEl.querySelector('svg')).toBeTruthy();
  });
});
