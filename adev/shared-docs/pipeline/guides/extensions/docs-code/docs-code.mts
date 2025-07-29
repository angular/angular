/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TokenizerThis, RendererThis} from 'marked';
import {CodeToken, formatCode} from './format/index.mjs';
import {FileType, removeEslintComments} from './sanitizers/eslint.mjs';
import {loadWorkspaceRelativeFile} from '../../utils.mjs';

/** Marked token for a custom docs element. */
export interface DocsCodeToken extends CodeToken {
  type: 'docs-code';
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const singleFileCodeRule =
  /^\s*<docs-code((?:\s+[\w-]+(?:="[^"]*"|='[^']*'|=[^\s>]*)?)*)\s*(?:\/>|>(.*?)<\/docs-code>)/s;

const pathRule = /path="([^"]*)"/;
const classRule = /class="([^"]*)"/;
const headerRule = /header="([^"]*)"/;
const linenumsRule = /linenums/;
const highlightRule = /highlight="([^"]*)"/;
const diffRule = /diff="([^"]*)"/;
const languageRule = /language="([^"]*)"/;
const visibleLinesRule = /visibleLines="([^"]*)"/;
const visibleRegionRule = /visibleRegion="([^"]*)"/;
const previewRule = /preview/;

export const docsCodeExtension = {
  name: 'docs-code',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^<docs-code\s/)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsCodeToken | undefined {
    const match = singleFileCodeRule.exec(src);
    if (match) {
      const attr = match[1].trim();

      const path = pathRule.exec(attr);
      const header = headerRule.exec(attr);
      const linenums = linenumsRule.exec(attr);
      const highlight = highlightRule.exec(attr);
      const diff = diffRule.exec(attr);
      const language = languageRule.exec(attr);
      const visibleLines = visibleLinesRule.exec(attr);
      const visibleRegion = visibleRegionRule.exec(attr);
      const preview = previewRule.exec(attr) ? true : false;
      const classes = classRule.exec(attr);

      let code = match[2]?.trim() ?? '';
      if (path && path[1]) {
        code = loadWorkspaceRelativeFile(path[1]);
        // Remove ESLint Comments
        const fileType: FileType | undefined = path[1]?.split('.').pop() as FileType;
        code = removeEslintComments(code, fileType);
      }

      const token: DocsCodeToken = {
        type: 'docs-code',
        raw: match[0],
        code: code,
        path: path?.[1],
        header: header?.[1],
        linenums: !!linenums,
        highlight: highlight?.[1],
        diff: diff?.[1],
        language: language?.[1],
        visibleLines: visibleLines?.[1],
        visibleRegion: visibleRegion?.[1],
        preview: preview,
        classes: classes?.[1]?.split(' '),
      };
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsCodeToken) {
    return formatCode(token);
  },
};
