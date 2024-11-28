/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';

import {AlertSeverityLevel} from '../../../guides/extensions/docs-alert';
import {parseMarkdown} from '../../../guides/parse';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(
      runfiles.resolvePackageRelative('docs-alert/docs-alert.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  for (let level in AlertSeverityLevel) {
    it(`should create a docs-alert for ${level}:`, () => {
      const noteEl = markdownDocument.querySelector(`.docs-alert-${level.toLowerCase()}`);
      // TLDR is written without a semi colon in the markdown, but is rendered
      // with a colon, as such we have to adjust our expectation here.
      if (level === AlertSeverityLevel.TLDR) {
        level = 'TL;DR';
      }
      expect(noteEl?.textContent?.trim()).toMatch(`^${level}:`);
    });
  }

  it(`should handle multi-line alerts`, () => {
    const noteEl = markdownDocument.querySelector(`.docs-alert-note`);

    expect(noteEl?.textContent?.trim()).toContain(`This is a multiline note`);
  });
});
