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
  style: 'prefer' | 'avoid' | undefined;
}

/**
 * Regex for discovering fenced code blocks, notably this is more limited than
 * standard discovery of this as it only allows for exactly 3 ticks rather
 * than three or more.
 */
const tripleTickCodeRule = /^\s*`{3}(\S*)(.*?)[\r\n]+(.*?)\s*`{3}/s;
//                        language --^    ^-- metadata ^-- code

export const docsCodeBlockExtension = {
  name: 'docs-code-block',
  level: 'block' as const,
  start(src: string) {
    return src.match(/(```)/)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsCodeBlock | undefined {
    const match = tripleTickCodeRule.exec(src);
    if (match) {
      const metadataStr = match[2].trim();

      const headerRule = /header\s*:\s*(['"`])([^'"`]+)\1/; // The 2nd capture matters here
      const highlightRule = /highlight\s*:\s*(.*)([^,])/;
      const hideCopyRule = /hideCopy/;
      const hideDollarRule = /hideDollar/;
      const preferRule = /\b(prefer|avoid)\b/;
      const linenumsRule = /linenums/;

      const token: DocsCodeBlock = {
        raw: match[0],
        type: 'docs-code-block',
        code: deindent(match[3]),
        language: match[1],
        header: headerRule.exec(metadataStr)?.[2],
        highlight: highlightRule.exec(metadataStr)?.[1],
        hideCopy: hideCopyRule.test(metadataStr),
        hideDollar: hideDollarRule.test(metadataStr),
        style: preferRule.exec(metadataStr)?.[1] as 'prefer' | 'avoid' | undefined,
        linenums: linenumsRule.test(metadataStr),
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

/**
 * Removes leading indentation from code blocks.
 */
function deindent(str: string): string {
  const lines = str.split('\n');
  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) {
      minIndent = Math.min(line.match(/^(\s*)/)?.[1].length ?? 0, minIndent);
    }
  }
  if (minIndent === Infinity || minIndent === 0) {
    return str;
  }
  return lines.map((line) => line.slice(minIndent)).join('\n');
}
