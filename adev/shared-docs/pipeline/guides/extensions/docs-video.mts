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

    return `
    <div class="docs-video-container">
      <iframe
      class="docs-video"
      src="${token.src}"
      ${token.title ? `title="${token.title}"` : ''}
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      credentialless
      title="Video player"
      ></iframe>
    </div>
    `;
  },
};
