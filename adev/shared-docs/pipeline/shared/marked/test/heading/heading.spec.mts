/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {resolve} from 'node:path';
import {parseMarkdown} from '../../parse.mjs';
import {rendererContext} from '../renderer-context.mjs';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(resolve('./heading.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it('should treat # as document headers', () => {
    const header = markdownDocument.querySelector('header');
    expect(header?.classList.contains('docs-header')).toBeTrue();
  });

  it('should create a self referential link for non document headers', () => {
    const h2 = markdownDocument.querySelector('h2');
    const h2Anchor = h2?.firstElementChild;

    const h2HeaderId = h2?.getAttribute('id');
    const h2AnchorHref = h2Anchor?.getAttribute('href');

    expect(h2HeaderId).toContain('headers-h2');
    expect(h2AnchorHref).toBe(`#${h2HeaderId}`);
  });

  it('should make the docs anchors unreachable by tab', () => {
    const docsAnchors = markdownDocument.querySelectorAll('.docs-anchor');
    for (const anchor of docsAnchors) {
      expect(anchor.getAttribute('tabindex')).toBe('-1');
    }
  });

  // In case there is a valid usecase for duplicate header ids, we should use custom ids (as demonstrated below)
  it('uses same id when multiple duplicate header names are found', () => {
    const markdownDocument = JSDOM.fragment(
      parseMarkdown(
        `
## Duplicate Anchor
## Duplicate Anchor`,
        rendererContext,
      ),
    );

    const headers = markdownDocument.querySelectorAll('a.docs-anchor');
    expect(headers[0].getAttribute('href')).toBe(headers[1].getAttribute('href'));
  });

  it('should remove code block markups', () => {
    const markdownDocument = JSDOM.fragment(
      parseMarkdown('## `myClass.myMethod` is the best', rendererContext),
    );
    const h2 = markdownDocument.querySelector('h2')!;
    const h2Anchor = h2?.firstElementChild;

    const h2HeaderId = h2?.getAttribute('id');
    const h2AnchorHref = h2Anchor?.getAttribute('href');

    expect(h2HeaderId).toContain('myclassmymethod-is-the-best');
    expect(h2AnchorHref).toBe(`#${h2HeaderId}`);
  });

  it('should be able to extract non-ascii ids', () => {
    const markdownDocument = JSDOM.fragment(
      parseMarkdown(
        '## ステップ 2 - アプリケーションのレイアウトに新しいコンポーネントを追加',
        rendererContext,
      ),
    );
    const h2 = markdownDocument.querySelector('h2')!;
    const h2Anchor = h2?.firstElementChild;

    const h2HeaderId = h2?.getAttribute('id');
    const h2AnchorHref = h2Anchor?.getAttribute('href');

    expect(h2HeaderId).toContain(
      'ステップ-2---アプリケーションのレイアウトに新しいコンポーネントを追加',
    );
    expect(h2AnchorHref).toBe(`#${h2HeaderId}`);
  });

  it('should be able to extract custom ids', () => {
    const markdownDocument = JSDOM.fragment(
      parseMarkdown('## My heading {# my-custom-id }', rendererContext),
    );

    const h2 = markdownDocument.querySelector('h2')!;
    const h2Anchor = h2?.firstElementChild;

    const h2HeaderId = h2?.getAttribute('id');
    const h2AnchorHref = h2Anchor?.getAttribute('href');

    expect(h2HeaderId).toBe('my-custom-id');
    expect(h2AnchorHref).toBe(`#${h2HeaderId}`);

    // Verify that the custom ID syntax is removed from the displayed text
    expect(h2Anchor?.textContent?.trim()).toBe('My heading');
    expect(h2Anchor?.textContent).not.toContain('{#');
  });

  it('should be able to parse heading with a valid tag in a code block', () => {
    const markdownDocument = JSDOM.fragment(
      parseMarkdown('## Query for the `<h1>`', rendererContext),
    );
    const h2 = markdownDocument.querySelector('h2')!;

    // The anchor element should be to only child
    expect(h2.children.length).toBe(1);
    expect(h2.firstElementChild?.tagName).toBe('A');

    expect(h2.firstElementChild!.innerHTML).toBe('Query for the <code>&lt;h1&gt;</code>');
  });

  it('shoud now link symbols in headings', () => {
    const markdownDocument = JSDOM.fragment(
      parseMarkdown('## Hello **NEW** `Router` ', rendererContext),
    );
    const h2 = markdownDocument.querySelector('h2')!;

    // The anchor element should be to only child, no nested anchor
    expect(h2.children.length).toBe(1);

    // We ensure that we still style the heading content
    expect(markdownDocument.querySelector('strong')).toBeDefined();
  });
});
