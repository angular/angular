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

describe('markdown to html', () => {
  let parsedMarkdown: string;
  beforeAll(async () => {
    const markdownContent = await readFile(resolve('./link.md'), {encoding: 'utf-8'});
    parsedMarkdown = await parseMarkdown(markdownContent, {});
  });

  it('should render external links with _blank target', () => {
    expect(parsedMarkdown).toContain(
      '<a href="https://angular.dev" target="_blank">Angular Site</a>',
    );
  });

  it('should render links to anchors on the same page', () => {
    expect(parsedMarkdown).toContain('<a href="#test">same page</a>');
  });

  it('should render internal links that are relative paths', () => {
    expect(parsedMarkdown).toContain('<a href="../other/page">same site</a>');
  });
});
