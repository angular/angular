/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile} from 'fs/promises';
import {parseMarkdown} from '../../parse.mjs';
import {resolve} from 'node:path';
import {rendererContext} from '../renderer-context.mjs';

describe('markdown to html', () => {
  let parsedMarkdown: string;
  beforeAll(async () => {
    const markdownContent = await readFile(resolve('./link.md'), {encoding: 'utf-8'});
    parsedMarkdown = await parseMarkdown(markdownContent, rendererContext);
  });

  it('should render external links with _blank target', () => {
    expect(parsedMarkdown).toContain(
      '<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">Please click</a>',
    );
  });

  it('should render links to anchors on the same page', () => {
    expect(parsedMarkdown).toContain('<a href="#test">same page</a>');
  });

  it('should render internal links that are relative paths', () => {
    expect(parsedMarkdown).toContain('<a href="../other/page">same site</a>');
  });

  it('should render links with title attributes properly quoted', () => {
    expect(parsedMarkdown).toContain(
      '<a href="https://docs.npmjs.com/getting-started/what-is-npm" title="What is npm?" target="_blank">npm packages</a>',
    );
  });

  it('should throw if on absolute links to adev', async () => {
    try {
      parsedMarkdown = await parseMarkdown(
        '[Some absolute link](https://angular.dev/yeah-nope-should-be-relative)',
        {...rendererContext, markdownFilePath: '/content/guide/some-guide.md'},
      );
    } catch (e: any) {
      expect(e.message).toContain('Absolute links to angular.dev are not allowed');
      return;
    }
    fail('Did not throw for absolute link to angular.dev');
  });
});
