/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Token, Tokens, RendererThis, TokenizerThis} from 'marked';
import {anchorTarget, isExternalLink} from '../../helpers.mjs';
import {AdevDocsRenderer} from '../../renderer.mjs';

interface DocsPillToken extends Tokens.Generic {
  type: 'docs-pill';
  title: string;
  href: string;
  download: string | null;
  target: string | null;
  tokens: Token[];
}

// Capture group 1: all attributes on the docs-pill tag
const pillRule = /^\s*<docs-pill\s((?:.(?!\n))*)\/>/s;

const titleRule = /title="([^"]*)"/;
const hrefRule = /href="([^"]*)"/;
const downloadRule = /download="([^"]*)"/;
const targetRule = /target="([^"]*)"/;

export const docsPillExtension = {
  name: 'docs-pill',
  level: 'inline' as const,
  start(src: string) {
    return src.indexOf('<docs-pill ');
  },
  tokenizer(this: TokenizerThis, src: string): DocsPillToken | undefined {
    const match = pillRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const href = hrefRule.exec(attr);
      const download = downloadRule.exec(attr);
      const target = targetRule.exec(attr);

      const token: DocsPillToken = {
        type: 'docs-pill',
        raw: match[0],
        title: title ? title[1] : '',
        href: href ? href[1] : '',
        download: download ? download[1] : null,
        target: target ? target[1] : null,
        tokens: [],
      };
      this.lexer.inlineTokens(token.title, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsPillToken) {
    const downloadAttr = token.download ? ` download="${token.download}"` : '';
    const targetAttr = token.target ? ` target="${token.target}"` : anchorTarget(token.href);
    const renderer = this.parser.renderer as AdevDocsRenderer;

    if (!renderer.isKnownRoute(token.href)) {
      throw new Error(
        `Link target "${token.href}" is invalid in <docs-pill> in ${renderer.context.markdownFilePath} does not exist in the defined guide routes.`,
      );
    }

    return `
    <a class="docs-pill" href="${token.href}"${targetAttr}${downloadAttr}>
      ${this.parser.parseInline(token.tokens)}${
        isExternalLink(token.href)
          ? '<docs-icon class="docs-icon-small">open_in_new</docs-icon>'
          : ''
      }
    </a>
    `;
  },
};
