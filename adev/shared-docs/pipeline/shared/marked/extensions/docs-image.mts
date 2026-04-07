/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TokenizerThis, Tokens} from 'marked';

export interface DocsImage extends Tokens.Image {
  loading?: string;
  decoding?: string;
  fetchpriority?: string;
}

// Regex to match image syntax: ![alt](url {attrs} 'title') or ![alt](url 'title')
const imageRule = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+\{([^}]+)\})?(?:\s+['"]([^'"]+)['"])?\)/;

export const docsImageExtension = {
  name: 'docs-image',
  level: 'inline' as const,
  start(src: string) {
    return src.match(/!\[/)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsImage | undefined {
    const match = imageRule.exec(src);
    if (match) {
      const text = match[1];
      const href = match[2];
      const metadataStr = match[3] || '';
      const title = match[4] || null;

      const loadingRule = /loading\s*:\s*(['"`])([^'"`]+)\1/;
      const decodingRule = /decoding\s*:\s*(['"`])([^'"`]+)\1/;
      const fetchpriorityRule = /fetchpriority\s*:\s*(['"`])([^'"`]+)\1/;

      const token: DocsImage = {
        type: 'image',
        raw: match[0],
        href,
        title,
        text,
        tokens: [],
        loading: loadingRule.exec(metadataStr)?.[2],
        decoding: decodingRule.exec(metadataStr)?.[2],
        fetchpriority: fetchpriorityRule.exec(metadataStr)?.[2],
      };
      return token;
    }
    return undefined;
  },
};
