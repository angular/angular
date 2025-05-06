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
      runfiles.resolvePackageRelative('docs-step/docs-step.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('should create a list item for each step', () => {
    const stepEls = markdownDocument.querySelectorAll('li')!;
    expect(stepEls.length).toBe(2);
  });

  it('should render each step with the provided information', () => {
    const [firstStepEl, secondStepEl] = markdownDocument.querySelectorAll('li');

    const firstStepAEl = firstStepEl.querySelector('a')!;
    const firstStepTextContentEl = firstStepEl.querySelector('p')!;
    const firstStepHeadingEl = firstStepEl.querySelector('h3')!;

    expect(firstStepHeadingEl.textContent?.trim()).toBe('Step 1');
    expect(firstStepTextContentEl.textContent).toContain('first thing');
    expect(firstStepAEl.getAttribute('href')).toBe(`#${firstStepHeadingEl.getAttribute('id')}`);
    expect(firstStepAEl.getAttribute('tabindex')).toBe('-1');

    expect(secondStepEl.querySelector('h3')?.textContent?.trim()).toBe('Step B');
    expect(secondStepEl.querySelector('p')?.textContent).toContain('another thing');
  });

  it('should create a self referencial anchor for the step', () => {
    const firstStepEl = markdownDocument.querySelector('li')!;
    const firstStepAEl = firstStepEl.querySelector('a')!;
    const firstStepHeadingEl = firstStepEl.querySelector('h3')!;

    expect(firstStepAEl.getAttribute('href')).toBe(`#${firstStepHeadingEl.getAttribute('id')}`);
    expect(firstStepAEl.getAttribute('tabindex')).toBe('-1');
  });

  it('should create a a link that is not reachable via tab', () => {
    const firstStepEl = markdownDocument.querySelector('li')!;
    const firstStepAEl = firstStepEl.querySelector('a')!;

    expect(firstStepAEl.getAttribute('tabindex')).toBe('-1');
  });
});
