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
const lineAddedClassName: string = 'add';
const lineRemovedClassName: string = 'remove';
const lineHighlightedClassName: string = 'highlighted';

/**
 * Updates the provided token's code value to include syntax highlighting.
 */
export function highlightCode(highlighter: HighlighterGeneric<any, any>, token: CodeToken) {
  // TODO(josephperrott): Handle mermaid usages i.e. language == mermaidClassName
  if (token.language !== 'none' && token.language !== 'file') {
    // Decode the code content to replace HTML entities to characters
    const language = token.language ?? guessLanguageFromPath(token.path);

    const codeAsHtml = codeToHtml(highlighter, token.code, language);
    token.code = codeAsHtml;
  }

  const dom = new JSDOM(token.code);
  const document = dom.window.document;
  const lines = document.body.querySelectorAll('.line');

  // removing whitespaces text nodes so we don't have spaces between codelines
  removeWhitespaceNodes(document.body.querySelector('.shiki > code'));

  const linesCount = lines.length;
  if (linesCount === 0) {
    return;
  }

  let lineIndex = 0;
  let resultFileLineIndex = 1;

  const highlightedLineRanges = token.highlight ? expandRangeStringValues(token.highlight) : [];

  do {
    const isRemovedLine = token.diffMetadata?.linesRemoved.includes(lineIndex);
    const isAddedLine = token.diffMetadata?.linesAdded.includes(lineIndex);
    const isHighlighted = highlightedLineRanges.includes(lineIndex);
    const addClasses = (el: Element) => {
      if (isRemovedLine) {
        el.classList.add(lineRemovedClassName);
      }
      if (isAddedLine) {
        el.classList.add(lineAddedClassName);
      }
      if (isHighlighted) {
        el.classList.add(lineHighlightedClassName);
      }
    };

    const currentline = lines[lineIndex];
    addClasses(currentline);

    if (!!token.linenums) {
      const lineNumberEl = JSDOM.fragment(
        `<span role="presentation" class="${lineNumberClassName}"></span>`,
      ).firstElementChild!;
      addClasses(lineNumberEl);
      lineNumberEl.textContent = isRemovedLine ? '-' : isAddedLine ? '+' : `${resultFileLineIndex}`;

      currentline.parentElement!.insertBefore(lineNumberEl, currentline);
      resultFileLineIndex++;
    }

    lineIndex++;
  } while (lineIndex < linesCount);

  token.code = document.body.innerHTML;
}

/**
 *
 * Removed whitespaces between 1st level children
 */
function removeWhitespaceNodes(parent: Element | null) {
  if (!parent) {
    return;
  }

  const childNodes = parent.childNodes;
  for (let i = childNodes.length - 1; i >= 0; i--) {
    const node = childNodes[i];
    if (node.nodeType === 3 && !/\S/.test(node.nodeValue!)) {
      parent.removeChild(node);
    }
  }
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
