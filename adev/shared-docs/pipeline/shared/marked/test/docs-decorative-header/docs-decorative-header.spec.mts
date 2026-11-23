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
    const markdownContent = await readFile(resolve('./docs-decorative-header.md'), {
      encoding: 'utf-8',
    });
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
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

  for (const gradientBackground of [false, true]) {
    it(`links to the source file on GitHub (gradientBackground=${gradientBackground})`, () => {
      const markdownDocument = JSDOM.fragment(
        parseMarkdown(
          `<docs-decorative-header title="Custom Title" gradientBackground="${gradientBackground}"></docs-decorative-header>`,
          {...rendererContext, markdownFilePath: 'adev/src/content/overview.md'},
        ),
      );

      expect(markdownDocument.querySelector('.docs-github-links')?.getAttribute('href')).toBe(
        'https://github.com/angular/angular/edit/main/adev/src/content/overview.md',
      );
    });
  }
});
