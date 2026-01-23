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
    const markdownContent = await readFile(resolve('./image.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it('should wrap images in custom classes', () => {
    const image = markdownDocument.querySelector('img');
    expect(image?.classList.contains('docs-image')).toBeTrue();
  });

  it('should handle images hosted internal to the application', () => {
    const image = markdownDocument.querySelector('img[title="Local Image"]');
    expect(image?.getAttribute('src')).toBe('unknown/some-image.png');
  });

  it('should add loading attribute when specified', () => {
    const image = markdownDocument.querySelectorAll('img')[2];
    expect(image?.getAttribute('loading')).toBe('lazy');
  });

  it('should add decoding attribute when specified', () => {
    const image = markdownDocument.querySelectorAll('img')[3];
    expect(image?.getAttribute('decoding')).toBe('async');
    expect(image?.getAttribute('title')).toBe('Async Image');
  });

  it('should add fetchpriority attribute when specified', () => {
    const image = markdownDocument.querySelectorAll('img')[4];
    expect(image?.getAttribute('fetchpriority')).toBe('high');
  });

  it('should handle multiple attributes with title', () => {
    const image = markdownDocument.querySelectorAll('img')[5];
    expect(image?.getAttribute('loading')).toBe('eager');
    expect(image?.getAttribute('decoding')).toBe('sync');
    expect(image?.getAttribute('fetchpriority')).toBe('high');
    expect(image?.getAttribute('title')).toBe('Hero Image');
  });
});
