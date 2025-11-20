/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CodeToken} from './index.mjs';
import {expandRangeStringValues} from './range.mjs';
import {JSDOM} from 'jsdom';
import {HighlighterGeneric} from 'shiki';
import {codeToHtml} from '../../../../shiki.mjs';

const lineNumberClassName: string = 'shiki-ln-number';

/**
 * Updates the provided token's code value to include syntax highlighting.
 */
export function highlightCode(highlighter: HighlighterGeneric<any, any>, token: CodeToken) {
  // TODO(josephperrott): Handle mermaid usages i.e. language == mermaidClassName
  if (token.language !== 'none' && token.language !== 'file') {
    // Decode the code content to replace HTML entities to characters
    const language = token.language ?? guessLanguageFromPath(token.path);
    /** The set of all lines which should be highlighted. */
    const highlight = token.highlight
      ? new Set(expandRangeStringValues(token.highlight))
      : undefined;

    token.code = codeToHtml(highlighter, token.code, {language, highlight});
  }

  const dom = new JSDOM(token.code);
  const document = dom.window.document;
  const lines = document.body.querySelectorAll('.line');

  const linesCount = lines.length;
  if (linesCount === 0) {
    return;
  }

  let lineIndex = 0;
  let resultFileLineIndex = 1;

  do {
    const currentline = lines[lineIndex];

    if (!!token.linenums) {
      const lineNumberEl = JSDOM.fragment(
        `<span role="presentation" class="${lineNumberClassName}"></span>`,
      ).firstElementChild!;
      lineNumberEl.textContent = `${resultFileLineIndex}`;

      currentline.parentElement!.insertBefore(lineNumberEl, currentline);
      resultFileLineIndex++;
    }

    lineIndex++;
  } while (lineIndex < linesCount);

  token.code = document.body.innerHTML;
}

function guessLanguageFromPath(path: string | undefined): string {
  const extension = path?.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
    case 'js':
      return 'typescript';
    case 'html':
      return 'angular-html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    default:
      return 'angular-ts';
  }
}
