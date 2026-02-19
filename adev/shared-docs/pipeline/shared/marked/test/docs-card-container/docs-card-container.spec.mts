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
    const markdownContent = await readFile(resolve('docs-card-container.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it('creates multiple card containers with correct card counts', () => {
    const containers = markdownDocument.querySelectorAll('.docs-card-grid');

    expect(containers.length).toBe(2);
    expect(containers[0].children.length).toBe(2);
    expect(containers[1].children.length).toBe(1);
  });

  it('preserves all h2 section headings', () => {
    const h2Elements = markdownDocument.querySelectorAll('h2');

    expect(h2Elements.length).toBe(3);
    expect(h2Elements[0].textContent).toContain('First Section');
    expect(h2Elements[1].textContent).toContain('Second Section');
    expect(h2Elements[2].textContent).toContain('Final Section');
  });

  it('preserves all h3 subsection headings outside card containers', () => {
    // Card titles also render as h3, so we filter to only h3s not inside card containers
    const allH3s = Array.from(markdownDocument.querySelectorAll('h3'));
    const sectionH3s = allH3s.filter((h3) => !h3.closest('.docs-card-grid'));

    expect(sectionH3s.length).toBe(3);
    expect(sectionH3s[0].textContent).toContain('Available features');
    expect(sectionH3s[1].textContent).toContain('In progress');
    expect(sectionH3s[2].textContent).toContain('Additional context');
  });

  it('preserves unordered lists before card containers', () => {
    const ulElements = markdownDocument.querySelectorAll('ul');

    expect(ulElements.length).toBeGreaterThanOrEqual(1);
    expect(ulElements[0].children.length).toBe(3);
    expect(ulElements[0].textContent).toContain('Feature one');
  });

  it('preserves ordered lists before card containers', () => {
    const olElements = markdownDocument.querySelectorAll('ol');

    expect(olElements.length).toBe(1);
    expect(olElements[0].children.length).toBe(2);
    expect(olElements[0].textContent).toContain('Item A');
  });

  it('preserves paragraphs throughout the document', () => {
    const paragraphs = markdownDocument.querySelectorAll('p');

    expect(paragraphs.length).toBeGreaterThanOrEqual(5);

    const paragraphTexts = Array.from(paragraphs).map((p) => p.textContent);
    expect(paragraphTexts.some((t) => t?.includes('Introductory paragraph'))).toBeTrue();
    expect(paragraphTexts.some((t) => t?.includes('important information'))).toBeTrue();
    expect(paragraphTexts.some((t) => t?.includes('More text after'))).toBeTrue();
    expect(paragraphTexts.some((t) => t?.includes('Another paragraph'))).toBeTrue();
    expect(paragraphTexts.some((t) => t?.includes('Concluding remarks'))).toBeTrue();
  });
});
