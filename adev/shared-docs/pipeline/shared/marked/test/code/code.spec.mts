/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile} from 'fs/promises';
import {parseMarkdown, parseMarkdownAsync} from '../../parse.mjs';
import {resolve} from 'node:path';
import {rendererContext, setHighlighter} from '../renderer-context.mjs';

describe('markdown to html', () => {
  let parsedMarkdown: string;
  beforeAll(async () => {
    const markdownContent = await readFile(resolve('./code.md'), {encoding: 'utf-8'});
    parsedMarkdown = await parseMarkdown(markdownContent, rendererContext);
    await setHighlighter();
  });

  it('should render symbol with link', () => {
    expect(parsedMarkdown).toContain(
      '<a href="/api/angular/common/CommonModule"><code>CommonModule</code></a>',
    );
  });

  it('should render symbol + prop with link ', () => {
    expect(parsedMarkdown).toContain(
      '<a href="/api/angular/core/ApplicationRef#tick"><code>ApplicationRef.tick</code></a>',
    );
  });

  it('should render symbol + method with link ', () => {
    expect(parsedMarkdown).toContain(
      ' <a href="/api/angular/router/Router#lastSuccessfulNavigation"><code>Router.lastSuccessfulNavigation()</code></a>',
    );
  });

  it('should parse header with quotes inside', async () => {
    const markdown = '```angular-ts {avoid, header: "Can\'t inject interface"}\nconst x = 1;\n```';
    const parsed = await parseMarkdownAsync(markdown, rendererContext);

    expect(parsed).toContain("Can't inject interface");
    expect(parsed).toContain('<span class="docs-code-header-style ">Avoid</span>');
    expect(parsed).toContain("<h3>Can't inject interface</h3>");
  });
});
