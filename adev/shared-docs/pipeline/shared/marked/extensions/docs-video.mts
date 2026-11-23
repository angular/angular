/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens, TokenizerThis, RendererThis} from 'marked';

interface DocsVideoToken extends Tokens.Generic {
  type: 'docs-video';
  src: string;
  title: string | undefined;
}

// Capture group 1: all attributes on the opening tag
const videoRule = /^<docs-video([^>]*)\/>/s;

const srcRule = /src="([^"]*)"/;
const titleRule = /title="([^"]*)"/;
const validYTUrlPrefix = 'https://www.youtube.com/embed/';

export const docsVideoExtension = {
  name: 'docs-video',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-video/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsVideoToken | undefined {
    const match = videoRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const src = srcRule.exec(attr);
      const title = titleRule.exec(attr);

      if (src !== null) {
        return {
          type: 'docs-video',
          raw: match[0],
          src: src[1],
          title: title?.[1],
        };
      }
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsVideoToken) {
    if (!token.src.startsWith(validYTUrlPrefix)) {
      process.stdout.write(
        `<docs-video> cannot load: ${token.src}. YouTube Player API expects src to begin with ${validYTUrlPrefix}.\n`,
      );
    }

    const videoId = /\/embed\/([^/?#]+)/.exec(token.src)?.[1];
    const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}&autoplay=1` : token.src;
    const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '';
    const label = token.title ? `Play video: ${token.title}` : 'Play video';

    return `
    <div class="docs-video-container">
      <a
        class="docs-video-facade"
        href="${watchUrl}"
        target="_blank"
        rel="noopener"
        aria-label="${label}"
        data-video-src="${token.src}"
        ${token.title ? `data-video-title="${token.title}"` : ''}
      >
        <img class="docs-video-thumbnail" src="${thumbnail}" alt="" loading="lazy" />
        <span class="docs-video-play-button" aria-hidden="true">
          <svg viewBox="0 0 68 48" width="68" height="48">
            <path
              class="docs-video-play-button-bg"
              d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
            />
            <path d="M45 24 27 14v20z" fill="#fff" />
          </svg>
        </span>
      </a>
    </div>
    `;
  },
};
