/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {resolve} from 'node:path';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';

import {AlertSeverityLevel} from '../../extensions/docs-alert.mjs';
import {parseMarkdown} from '../../parse.mjs';
import {rendererContext} from '../renderer-context.mjs';

describe('markdown to html', () => {
  let html: string;
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(resolve('docs-alert.md'), {encoding: 'utf-8'});
    html = await parseMarkdown(markdownContent, rendererContext);
    markdownDocument = JSDOM.fragment(html);
  });

  for (const [key, level] of Object.entries(AlertSeverityLevel)) {
    it(`should create a docs-alert for ${key}:`, () => {
      const noteEl = markdownDocument.querySelector(`.docs-alert-${key.toLowerCase()}`);
      expect(noteEl?.textContent?.trim()).toMatch(new RegExp(`^${level}:`));
    });
  }

  it(`should handle multi-line alerts`, () => {
    const noteEl = markdownDocument.querySelector(`.docs-alert-note`);

    expect(noteEl?.textContent?.trim()).toContain(`This is a multiline note`);
  });

  it(`should handle an alert that follows prose in the same paragraph`, () => {
    const tipEls = markdownDocument.querySelectorAll(`.docs-alert-tip`);

    expect(tipEls[tipEls.length - 1]?.textContent?.trim()).toContain(
      `THIS TIP FOLLOWS PROSE ON THE NEXT LINE`,
    );
  });

  it(`should handle alerts without a line return`, () => {
    const noteEl = markdownDocument.querySelector(`.docs-alert-note:last-of-type`);

    expect(noteEl?.textContent?.trim()).toContain(`THIS NOTE WITHOUT A LINE RETURN`);
  });

  it(`should not wrap alerts in a paragraph`, () => {
    expect(html).not.toMatch(/<p>\s*<div class="docs-alert/);
    expect(html).toMatch(/<p>Some prose[^<]*<\/p>\s*<div class="docs-alert docs-alert-tip">/);
  });
});
