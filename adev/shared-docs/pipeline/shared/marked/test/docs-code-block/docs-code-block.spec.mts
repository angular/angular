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
import {rendererContext, setHighlighter} from '../renderer-context.mjs';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    await setHighlighter();
    const markdownContent = await readFile(resolve('./docs-code-block.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it('should converts triple ticks into a code block', () => {
    const codeBlock = markdownDocument.querySelector('code');
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).toBe('this is a code block');
  });

  it('should parse all 6 code blocks', () => {
    const codeBlocks = markdownDocument.querySelectorAll('.docs-code');

    expect(codeBlocks.length).toBe(6);
  });

  it('should deindent code blocks correctly', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[1];
    expect(codeBlock.innerHTML).toContain(`  // bar`);
  });

  it('should handle code blocks without language', () => {
    const codeBlock = markdownDocument.querySelectorAll('.docs-code')[2];
    expect(codeBlock).toBeDefined();
  });

  describe('API links', () => {
    it('should convert multiple API symbols in a single span to links', () => {
      const codeBlock = markdownDocument.querySelectorAll('.docs-code')[3];
      const links = codeBlock.querySelectorAll('a');

      // Should have links for CommonModule, ApplicationRef, and Router
      expect(links.length).toBeGreaterThanOrEqual(3);

      const linkTexts = Array.from(links).map((link) => link.textContent);
      expect(linkTexts).toContain('CommonModule');
      expect(linkTexts).toContain('ApplicationRef');
      expect(linkTexts).toContain('Router');
    });

    it('should generate correct URLs for API symbols', () => {
      const codeBlock = markdownDocument.querySelectorAll('.docs-code')[3];
      const links = codeBlock.querySelectorAll('a');

      const commonModuleLink = Array.from(links).find(
        (link) => link.textContent === 'CommonModule',
      );
      expect(commonModuleLink?.getAttribute('href')).toBe('/api/angular/common/CommonModule');

      const applicationRefLink = Array.from(links).find(
        (link) => link.textContent === 'ApplicationRef',
      );
      expect(applicationRefLink?.getAttribute('href')).toBe('/api/angular/core/ApplicationRef');

      const routerLink = Array.from(links).find((link) => link.textContent === 'Router');
      expect(routerLink?.getAttribute('href')).toBe('/api/angular/router/Router');
    });

    it('should link all API symbols when multiple appear in the same span', () => {
      // Test the case where Shiki groups multiple symbols in one span (e.g., "CommonModule, Router")
      const codeBlock = markdownDocument.querySelectorAll('.docs-code')[4];
      const links = codeBlock.querySelectorAll('a');

      const linkTexts = Array.from(links).map((link) => link.textContent);

      // Both CommonModule and Router should be linked even if they're in the same span
      expect(linkTexts).toContain('CommonModule');
      expect(linkTexts).toContain('Router');
      expect(linkTexts).toContain('ApplicationRef');
    });

    it('should preserve surrounding text and punctuation when creating links', () => {
      const codeBlock = markdownDocument.querySelectorAll('.docs-code')[4];
      const codeText = codeBlock.textContent || '';

      // Check that array brackets are preserved
      expect(codeText).toContain('[');
      expect(codeText).toContain(']');

      // Check that the structure is maintained
      expect(codeText).toContain('const modules');
      expect(codeText).toContain('const ref');
    });

    it('should not convert symbols in comments to links', () => {
      const codeBlock = markdownDocument.querySelectorAll('.docs-code')[5];
      const allLinks = codeBlock.querySelectorAll('a');
      const linkTexts = Array.from(allLinks).map((link) => link.textContent);

      // bootstrapApplication should be linked (it's in actual code)
      expect(linkTexts).toContain('bootstrapApplication');

      // Verify that symbols mentioned in comments are NOT linked
      // The comments mention CommonModule, Router, and ApplicationRef, but these should not be links
      expect(linkTexts).not.toContain('CommonModule');
      expect(linkTexts).not.toContain('Router');
      expect(linkTexts).not.toContain('ApplicationRef');

      // Double-check by inspecting comment spans (Shiki marks comments with #6A737D color)
      const allSpans = codeBlock.querySelectorAll('span');
      allSpans.forEach((span) => {
        const style = span.getAttribute('style') || '';
        // If this is a comment span (gray color #6A737D)
        if (style.includes('#6A737D') || style.includes('#6a737d')) {
          const linksInComment = span.querySelectorAll('a');
          expect(linksInComment.length).toBe(
            0,
            `Comment spans should not contain links. Found in: "${span.textContent}"`,
          );
        }
      });
    });
  });
});
