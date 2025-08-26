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
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(resolve('docs-alert.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
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
});
