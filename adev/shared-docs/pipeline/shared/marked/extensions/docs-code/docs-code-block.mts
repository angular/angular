/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TokenizerThis, RendererThis} from 'marked';
import {CodeToken, formatCode} from './format/index.mjs';
import {AdevDocsRenderer} from '../../renderer.mjs';

export interface DocsCodeBlock extends CodeToken {
  type: 'docs-code-block';
  // Nested code
  code: string;
  // Code language
  language: string | undefined;
}

// TODO: use regex for code implemented in the marked package: https://github.com/markedjs/marked/blob/4e6acc8b8517eafe0036a914f58b6f53d4b12ca6/src/rules.ts#L72C1-L73C1
/**
 * Regex for discovering code blocks, notably this is more limited than
 * standard discovery of this as it only allows for exactly 3 ticks rather
 * than three or more.
 */
const tripleTickCodeRule = /^\s*`{3}(\S+)[\r\n]+(.*?)[\r\n]+`{3}/s;

export const docsCodeBlockExtension = {
  name: 'docs-code-block',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^(```)\s/)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsCodeBlock | undefined {
    const match = tripleTickCodeRule.exec(src);
    if (match) {
      const token: DocsCodeBlock = {
        raw: match[0],
        type: 'docs-code-block',
        code: match[2],
        language: match[1],
      };
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsCodeBlock) {
    if (token.language === 'mermaid') {
      return token.code;
    }
    return formatCode(token, (this.parser.renderer as AdevDocsRenderer).context);
  },
};
