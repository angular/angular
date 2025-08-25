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
    const markdownContent = await readFile(resolve('./docs-video.md'), {encoding: 'utf-8'});
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, rendererContext));
  });

  it('should create an iframe in a container', () => {
    const videoContainerEl = markdownDocument.querySelector('.docs-video-container')!;
    const iframeEl = videoContainerEl.children[0];

    expect(videoContainerEl.children.length).toBe(1);

    expect(iframeEl.nodeName).toBe('IFRAME');
    expect(iframeEl.getAttribute('src')).toBeTruthy();
    expect(iframeEl.classList.contains('docs-video')).toBeTrue();
    expect(iframeEl.getAttribute('title')).toBeTruthy();
  });
});
