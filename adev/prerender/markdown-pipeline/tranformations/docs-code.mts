/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import hljs from 'highlight.js';
import * as diff from 'diff';
import {join} from 'path';
import {readFileSync} from 'fs';
import {decode} from 'html-entities';
import {regionParser} from '../regions/region-parser.mjs';
import {EXAMPLES_FOLDER_PATH, TUTORIALS_FOLDER_PATH} from '../constants.mjs';
import {DocumentType, getCurrentParsedDocumentType} from '../state.mjs';

/** Marked token for a multifile custom docs element. */
export interface DocsCodeMultifileToken extends marked.Tokens.Generic {
  type: 'docs-code-multifile';
  // The example path used for linking to Stackblitz or rendering a preview
  path: string | undefined;
  // The raw nested Markdown of <docs-code> examples in the multifile example
  panes: string;
  // The DocsCodeToken of the nested <docs-code> examples
  paneTokens: marked.Token[];
  // True if we should display preview
  preview: boolean;
}

/** Marked token for a custom docs element. */
export interface DocsCodeToken extends marked.Tokens.Generic {
  type: 'docs-code';
  // Nested code OR the code from the optional file path
  code: string;
  // The example file path
  path: string | undefined;
  // The example display header
  header: string | undefined;
  // Code language
  language: string | undefined;
  // True if styled with line numbers
  linenums: boolean | undefined;
  // The lines to display highlighting on
  highlight: string | undefined;
  // The example path to determine diff (lines added/removed)
  diff: string | undefined;
  // The lines viewable in collapsed view
  visibleLines: string | undefined;
  // The name of the viewable region in the collapsed view
  visibleRegion: string | undefined;
  // True if we should display preview
  preview: boolean;
}

export interface DocsCodeTripleTickBlockToken extends marked.Tokens.Generic {
  type: 'docs-code-triple-tick';
  // Nested code
  code: string;
  // Code language
  language: string | undefined;
}

interface DiffMetadata {
  code: string;
  linesAdded: number[];
  linesRemoved: number[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const multiFileCodeRule = /^\s*<docs-code-multifile(.*?)>(.*?)<\/docs-code-multifile>/s;
const singleFileSelfClosingCodeRule = /^\s*<docs-code\s([^>]*)((?:.(?!\/>))*)\/>/s;
const singleFileCodeRule = /^\s*<docs-code\s([^>]*)>((?:.(?!\/docs-code))*)<\/docs-code>/s;
// TODO: use regex for code implemented in the marked package: https://github.com/markedjs/marked/blob/4e6acc8b8517eafe0036a914f58b6f53d4b12ca6/src/rules.ts#L72C1-L73C1
const tripleTickCodeRule = /^\s*`{3}(\w+)[\r\n]+(.*?)[\r\n]+`{3}/s;

const pathRule = /path="([^"]*)"/;
const headerRule = /header="([^"]*)"/;
const linenumsRule = /linenums/;
const highlightRule = /highlight="([^"]*)"/;
const diffRule = /diff="([^"]*)"/;
const languageRule = /language="([^"]*)"/;
const visibleLinesRule = /visibleLines="([^"]*)"/;
const visibleRegionRule = /visibleRegion="([^"]*)"/;
const previewRule = /preview/;

const lineNumberClassName: string = 'hljs-ln-number';
const lineMultifileClassName: string = 'hljs-ln-line';
const lineAddedClassName: string = 'add';
const lineRemovedClassName: string = 'remove';
const lineHighlightedClassName: string = 'highlighted';

const mermaidClassName = 'mermaid';

export const docsCodeMultifileExtension = {
  name: 'docs-code-multifile',
  level: 'block',
  start(src: string) {
    return src.match(/^\s*<docs-code-multifile/)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsCodeMultifileToken | undefined {
    const match = multiFileCodeRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const path = pathRule.exec(attr);
      const preview = previewRule.exec(attr) ? true : false;

      const token: DocsCodeMultifileToken = {
        type: 'docs-code-multifile',
        raw: match[0],
        path: path?.[1],
        panes: match[2].trim(),
        paneTokens: [],
        preview: preview,
      };
      this.lexer.blockTokens(token.panes, token.paneTokens);
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsCodeMultifileToken) {
    const attributes = getAttribute('path', token.path) + getAttribute('preview', token.preview);

    return `
    <div class="docs-code-multifile"${attributes}>
    ${this.parser.parse(token.paneTokens)}
    </div>
    `;
  },
};

export const docsCodeExtension = {
  name: 'docs-code',
  level: 'block',
  start(src: string) {
    return src.match(/^<docs-code\s/)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsCodeToken | undefined {
    const code = singleFileCodeRule.exec(src);
    const selfClosingCode = singleFileSelfClosingCodeRule.exec(src);
    const match = selfClosingCode ?? code;

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

      let code = match[2].trim();
      if (path && path[1]) {
        code = getCodeFromPath(path[1]);
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
      };
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsCodeToken) {
    return formatDocsCode(token);
  },
};

export const docsTripleTickMarkdownCodeExtension = {
  name: 'docs-code-triple-tick',
  level: 'block',
  start(src: string) {
    return src.match(/^(```)\s/)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsCodeTripleTickBlockToken | undefined {
    const match = tripleTickCodeRule.exec(src);
    if (match) {
      const token: DocsCodeTripleTickBlockToken = {
        raw: match[0],
        type: 'docs-code-triple-tick',
        code: match[2],
        language: match[1],
      };
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsCodeTripleTickBlockToken) {
    return formatDocsCode({code: token.code, language: token.language});
  },
};

function formatDocsCode(token: Partial<DocsCodeToken>): string {
  let diffData: DiffMetadata | null = null;

  if (!token.code) {
    throw new Error('Undefined code in DocsCodeToken!');
  }

  let code = token.code;

  if (token.diff) {
    diffData = getDiffData(token.diff, code);
    code = diffData.code;
  }

  const highlightedLines = token.highlight ? getRangeValues(token.highlight) : [];

  const extractRegionsResult = extractRegions(token, code);
  code = extractRegionsResult.code;

  // Add highlighting based on the code language
  code = getHighlightedCode(token.language, code, diffData, highlightedLines, !!token.linenums);

  const attributes =
    getAttribute(
      'visibleLines',
      getRangeValues(extractRegionsResult.visibleLines ?? token.visibleLines)?.toString(),
    ) +
    getAttribute('path', token.diff ?? token.path) +
    getAttribute('preview', token.preview) +
    getAttribute('header', token.header) +
    getAttribute('mermaid', token.language === mermaidClassName);
  const classes = getClass('shell', token.language == 'shell');

  const header = token.header ? `<div class="docs-code-header"><h3>${token.header}</h3></div>` : '';
  return `
  <div class="docs-code${classes}"${attributes}>
    ${header}
    <pre class="adev-mini-scroll-track">
      <code>${code}</code>
    </pre>
  </div>
  `;
}

function getCodeFromPath(path: string): string {
  const rootFolder =
    getCurrentParsedDocumentType() === DocumentType.DOCS
      ? EXAMPLES_FOLDER_PATH
      : TUTORIALS_FOLDER_PATH;
  return readFileSync(join(rootFolder, path), {encoding: 'utf-8'});
}

function getHighlightedCode(
  language: string | undefined,
  code: string,
  diffData: DiffMetadata | null,
  highlightedLines: number[] | null,
  displayLineNums: boolean,
): string {
  if (language == 'none' || language == 'file' || language == mermaidClassName || !highlightedLines)
    return code;

  // Decode the code content to replace HTML entities to characters
  const decodedCode = decode(code);
  const highlightResult = language
    ? hljs.highlight(decodedCode, {language})
    : hljs.highlightAuto(decodedCode);
  return appendModifierClassesToCodeLinesElements(
    highlightResult.value,
    diffData,
    highlightedLines,
    displayLineNums,
  );
}

function appendModifierClassesToCodeLinesElements(
  htmlString: string,
  diffData: DiffMetadata | null,
  highlightedLines: number[],
  displayLineNums: boolean,
): string {
  const lines = getLines(htmlString);
  let finalHtml = '';

  let lineIndex = 0;
  let resultFileLineIndex = 1;
  const linesCount = lines.length;

  if (linesCount === 0) {
    return htmlString;
  }

  do {
    const isRemovedLine = diffData?.linesRemoved.includes(lineIndex);
    const isAddedLine = diffData?.linesAdded.includes(lineIndex);
    const isHighlighted = highlightedLines.includes(lineIndex);
    const statusClasses = `${getClass(lineAddedClassName, isAddedLine)}${getClass(
      lineRemovedClassName,
      isRemovedLine,
    )}${getClass(lineHighlightedClassName, isHighlighted)}`;

    if (displayLineNums) {
      if (isRemovedLine) {
        finalHtml += `<span role="presentation" class="${lineNumberClassName}${statusClasses}">-</span>`;
      } else {
        finalHtml += `<span role="presentation" class="${lineNumberClassName}${statusClasses}">${
          isAddedLine ? '+' : resultFileLineIndex
        }</span>`;
        resultFileLineIndex++;
      }
    }
    finalHtml += `<div class="${lineMultifileClassName}${statusClasses}">${lines[lineIndex]}</div>`;
    lineIndex++;
  } while (lineIndex < linesCount);

  return finalHtml;
}

function getDiffData(diffPath: string, code: string): DiffMetadata {
  const changedCode = getCodeFromPath(diffPath);
  const change = diff.diffLines(code, changedCode);

  const getLinesRange = (start: number, count: number): number[] =>
    Array.from(Array(count).keys()).map((i) => i + start);

  let processedLines = 0;

  return change.reduce(
    (prev: DiffMetadata, part: diff.Change) => {
      const diff: DiffMetadata = {
        code: `${prev.code}${part.value}`,
        linesAdded: part.added
          ? [...prev.linesAdded, ...getLinesRange(processedLines, part.count ?? 0)]
          : prev.linesAdded,
        linesRemoved: part.removed
          ? [...prev.linesRemoved, ...getLinesRange(processedLines, part.count ?? 0)]
          : prev.linesRemoved,
      };
      processedLines += part.count ?? 0;
      return diff;
    },
    {
      code: '',
      linesAdded: [],
      linesRemoved: [],
    },
  );
}

function extractRegions(
  token: Partial<DocsCodeToken>,
  code: string,
): {code: string; visibleLines?: string} {
  if (!token.path) return {code};

  const result = regionParser(code, token.path);

  if (token.visibleRegion) {
    const region = result.regionMap[token.visibleRegion];

    if (!region) throw new Error(`Cannot find ${token.visibleRegion} in ${token.path}!`);

    return {
      code: result.contents,
      visibleLines: `[${region.ranges.map(
        (range) => `[${range.from}, ${range.to ?? result.totalLinesCount + 1}]`,
      )}]`,
    };
  }

  return {
    code: result.contents,
  };
}

function getLines(text: string): string[] {
  if (text.length === 0) {
    return [];
  }
  return text.split(/\r\n|\r|\n/g);
}

function getAttribute(name: string, value: boolean | number | string | undefined): string {
  return value ? ` ${name}="${value}"` : '';
}

function getClass(name: string, value: boolean | number | string | undefined): string {
  return value ? ` ${name}` : ``;
}

/**
 * The function used to generate ranges of highlighted or visible lines in code blocks
 */
function getRangeValues(token?: string): number[] | null {
  const getAllValuesFromRange = (range: any[]) => {
    const [start, end] = range;
    for (let i = start; i <= end; i++) {
      result.push(i - 1);
    }
  };

  if (!token) {
    return null;
  }

  let result: number[] = [];
  try {
    const boundaryValueArray = JSON.parse(token);
    if (!Array.isArray(boundaryValueArray)) {
      throw new Error('Provided token has wrong format!\n', boundaryValueArray);
    }
    // Flat Array
    if (
      boundaryValueArray.length === 2 &&
      !Array.isArray(boundaryValueArray[0]) &&
      !Array.isArray(boundaryValueArray[1])
    ) {
      getAllValuesFromRange(boundaryValueArray);
    } else {
      for (const range of boundaryValueArray) {
        if (Array.isArray(range) && range.length === 2) {
          getAllValuesFromRange(range);
        } else if (!Number.isNaN(range)) {
          result.push(Number(range - 1));
        } else {
          throw new Error('Input has wrong format!\n', range);
        }
      }
    }

    return result;
  } catch {
    return null;
  }
}
