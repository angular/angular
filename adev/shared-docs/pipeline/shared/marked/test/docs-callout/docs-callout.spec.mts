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
    const markdownContent = await readFile(resolve('docs-callout.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it(`defaults to a helpful callout`, () => {
    const calloutDiv =
      markdownDocument.querySelector('#default-marker')!.parentElement?.parentElement;
    calloutDiv?.classList.contains('docs-callout-helpful');
  });

  const parse = (markdown: string) => JSDOM.fragment(parseMarkdown(markdown, rendererContext));

  it('reads a title quoted with any of the supported quote characters', () => {
    for (const quote of ['"', "'", '`']) {
      expect(
        parse(`<docs-callout title=${quote}Quoted${quote}>Body</docs-callout>`).querySelector('h3')
          ?.textContent,
      )
        .withContext(`quoted with ${quote}`)
        .toBe('Quoted');
    }
  });

  it('reads a title that contains the other quote characters', () => {
    expect(
      parse(
        `<docs-callout title='Illustrating the "pristine" state'>Body</docs-callout>`,
      ).querySelector('h3')?.textContent,
    ).toBe('Illustrating the "pristine" state');
    expect(
      parse(`<docs-callout title="It's here">Body</docs-callout>`).querySelector('h3')?.textContent,
    ).toBe("It's here");
  });

  it('reads a title that contains a closing angle bracket', () => {
    expect(
      parse('<docs-callout title="Migrate a > b">Body</docs-callout>').querySelector('h3')
        ?.textContent,
    ).toBe('Migrate a > b');
  });

  it('takes the severity from the tag, not from the title text', () => {
    expect(
      parse('<docs-callout title="Why this is important">Body</docs-callout>').querySelector(
        '.docs-callout',
      )?.className,
    ).toBe('docs-callout docs-callout-helpful');
    expect(
      parse('<docs-callout title="A critical note">Body</docs-callout>').querySelector(
        '.docs-callout',
      )?.className,
    ).toBe('docs-callout docs-callout-helpful');
    expect(
      parse('<docs-callout important title="X">Body</docs-callout>').querySelector('.docs-callout')
        ?.className,
    ).toBe('docs-callout docs-callout-important');
    expect(
      parse('<docs-callout critical title="X">Body</docs-callout>').querySelector('.docs-callout')
        ?.className,
    ).toBe('docs-callout docs-callout-critical');
  });
});
