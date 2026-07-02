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

  it('should create a video facade in a container', () => {
    const videoContainerEl = markdownDocument.querySelector('.docs-video-container')!;
    const facadeEl = videoContainerEl.children[0];

    expect(videoContainerEl.children.length).toBe(1);

    expect(facadeEl.nodeName).toBe('A');
    expect(facadeEl.classList.contains('docs-video-facade')).toBeTrue();
    expect(facadeEl.getAttribute('href')).toContain('youtube.com/watch?v=');
    expect(facadeEl.getAttribute('data-video-src')).toBeTruthy();

    const thumbnailEl = facadeEl.querySelector('img.docs-video-thumbnail');
    expect(thumbnailEl?.getAttribute('src')).toContain('i.ytimg.com');

    expect(facadeEl.querySelector('.docs-video-play-button')).toBeTruthy();
  });
});
