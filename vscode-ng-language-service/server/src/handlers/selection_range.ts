/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import {getSCSSLanguageService} from 'vscode-css-languageservice';
import {getLanguageService as getHTMLLanguageService} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode-languageserver-textdocument';

import {getHTMLVirtualContent} from '../embedded_support';
import {Session} from '../session';
import {lspPositionToTsPosition, tsTextSpanToLspRange} from '../utils';

const htmlLS = getHTMLLanguageService();
const scssLS = getSCSSLanguageService();

/**
 * Handle the `textDocument/selectionRange` LSP request.
 *
 * Selection ranges provide smart selection expansion: select text → expand to element →
 * expand to parent → expand to block.
 */
export function onSelectionRange(
  session: Session,
  params: lsp.SelectionRangeParams,
): lsp.SelectionRange[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }

  const {languageService, scriptInfo} = lsInfo;

  // LSP requires result[i] to correspond to positions[i].
  // Keep cardinality and index alignment by returning an empty range fallback
  // whenever TS doesn't provide a selection chain for a position.
  return params.positions.map((position) => {
    const offset = lspPositionToTsPosition(scriptInfo, position);
    const angularSelectionRange = languageService.getSelectionRangeAtPosition(
      scriptInfo.fileName,
      offset,
    );

    const angularRange = angularSelectionRange
      ? convertSelectionRange(angularSelectionRange, scriptInfo)
      : undefined;
    const htmlRange = getHtmlSelectionRange(session, scriptInfo, position);
    const stylePropCssRange = getStylePropCssSelectionRange(scriptInfo, position);
    const styleMapCssRange = getStyleMapCssSelectionRange(scriptInfo, position);

    const delegatedRange = pickPreferredRange(
      angularRange,
      [htmlRange, stylePropCssRange, styleMapCssRange],
      scriptInfo,
      position,
    );
    if (delegatedRange) {
      return delegatedRange;
    }

    if (angularRange) {
      return angularRange;
    }

    if (htmlRange) {
      return htmlRange;
    }

    return {
      range: lsp.Range.create(position, position),
    };
  });
}

function getHtmlSelectionRange(
  session: Session,
  scriptInfo: any,
  position: lsp.Position,
): lsp.SelectionRange | undefined {
  const fileName = scriptInfo.fileName as string;

  if (fileName.endsWith('.html')) {
    const snapshot = scriptInfo.getSnapshot?.();
    if (!snapshot) {
      return undefined;
    }
    const text = snapshot.getText(0, snapshot.getLength());
    const doc = TextDocument.create(fileName, 'html', 0, text);
    return htmlLS.getSelectionRanges(doc, [position])[0];
  }

  if (!fileName.endsWith('.ts')) {
    return undefined;
  }

  if (typeof session.getDefaultProjectForScriptInfo !== 'function') {
    return undefined;
  }

  const sf = session.getDefaultProjectForScriptInfo(scriptInfo)?.getSourceFile(scriptInfo.path);
  if (!sf) {
    return undefined;
  }

  const virtualHtmlDoc = TextDocument.create(fileName, 'html', 0, getHTMLVirtualContent(sf));
  return htmlLS.getSelectionRanges(virtualHtmlDoc, [position])[0];
}

function pickPreferredRange(
  angularRange: lsp.SelectionRange | undefined,
  delegatedCandidates: Array<lsp.SelectionRange | undefined>,
  scriptInfo: any,
  position: lsp.Position,
): lsp.SelectionRange | undefined {
  const candidates = delegatedCandidates.filter(
    (r): r is lsp.SelectionRange => r !== undefined && rangeLength(scriptInfo, r.range) > 0,
  );

  if (!angularRange) {
    if (candidates.length === 0) {
      return undefined;
    }
    return candidates.sort(
      (a, b) => rangeLength(scriptInfo, a.range) - rangeLength(scriptInfo, b.range),
    )[0];
  }
  if (candidates.length === 0) {
    return angularRange;
  }

  const cursor = lspPositionToTsPosition(scriptInfo, position);
  const angularSpan = rangeToOffsetSpan(scriptInfo, angularRange.range);
  if (!containsOffset(angularSpan, cursor)) {
    return angularRange;
  }

  const angularLength = angularSpan.end - angularSpan.start;
  let best: lsp.SelectionRange | undefined;
  let bestLen = Number.MAX_SAFE_INTEGER;
  for (const candidate of candidates) {
    const span = rangeToOffsetSpan(scriptInfo, candidate.range);
    const len = span.end - span.start;
    if (len > 0 && len < angularLength && containsOffset(span, cursor) && len < bestLen) {
      best = candidate;
      bestLen = len;
    }
  }
  if (!best) {
    return angularRange;
  }

  // Keep Angular's outer semantic context as the outer parent when possible.
  const angularOutermost = getOutermost(angularRange);
  const topInsideAngular = getTopmostInside(best, angularOutermost.range);
  if (topInsideAngular && !rangesEqual(topInsideAngular.range, angularOutermost.range)) {
    topInsideAngular.parent = angularOutermost;
  }
  return best;
}

function getStylePropCssSelectionRange(
  scriptInfo: any,
  position: lsp.Position,
): lsp.SelectionRange | undefined {
  const snapshot = scriptInfo.getSnapshot?.();
  if (!snapshot) {
    return undefined;
  }
  const text = snapshot.getText(0, snapshot.getLength()) as string;
  const offset = lspPositionToTsPosition(scriptInfo, position);

  const bindingRegex = /\[style\.([A-Za-z0-9_-]+)\]\s*=\s*(["'])([\s\S]*?)\2/g;
  for (const match of text.matchAll(bindingRegex)) {
    const prop = match[1];
    const quote = match[2];
    const attrValue = match[3] ?? '';
    const full = match[0] ?? '';
    const matchIndex = match.index ?? -1;
    if (matchIndex < 0) {
      continue;
    }

    const quotePosInFull = full.indexOf(quote);
    if (quotePosInFull < 0) {
      continue;
    }

    const valueStart = matchIndex + quotePosInFull + 1;
    const valueEnd = valueStart + attrValue.length;
    if (offset < valueStart || offset > valueEnd) {
      continue;
    }

    const inner = findInnerQuotedLiteral(attrValue, offset - valueStart);
    if (!inner || /\r|\n/.test(inner.content)) {
      return undefined;
    }

    const cssSnippet = `a{${prop}:${inner.content};}`;
    const snippetValueStart = 2 + prop.length + 1;
    const cssOffset = snippetValueStart + inner.cursorInContent;

    const cssDoc = TextDocument.create('inmemory://angular-style.scss', 'scss', 0, cssSnippet);
    const stylesheet = scssLS.parseStylesheet(cssDoc);
    const cssChain = scssLS.getSelectionRanges(
      cssDoc,
      [cssDoc.positionAt(cssOffset)],
      stylesheet,
    )[0];

    const mapped = mapCssChainToOriginal(
      scriptInfo,
      cssChain,
      snippetValueStart,
      snippetValueStart + inner.content.length,
      valueStart + inner.contentStart,
    );
    if (mapped) {
      return mapped;
    }

    const fallback = getWordTokenSpan(inner.content, inner.cursorInContent);
    if (!fallback) {
      return undefined;
    }

    return {
      range: lsp.Range.create(
        offsetToLspPosition(scriptInfo, valueStart + inner.contentStart + fallback.start),
        offsetToLspPosition(scriptInfo, valueStart + inner.contentStart + fallback.end),
      ),
    };
  }

  return undefined;
}

function getStyleMapCssSelectionRange(
  scriptInfo: any,
  position: lsp.Position,
): lsp.SelectionRange | undefined {
  const snapshot = scriptInfo.getSnapshot?.();
  if (!snapshot) {
    return undefined;
  }
  const text = snapshot.getText(0, snapshot.getLength()) as string;
  const offset = lspPositionToTsPosition(scriptInfo, position);

  const mapBindingRegex = /\[(?:style|ngStyle)\]\s*=\s*(["'])([\s\S]*?)\1/g;
  for (const match of text.matchAll(mapBindingRegex)) {
    const full = match[0] ?? '';
    const attrValue = match[2] ?? '';
    const matchIndex = match.index ?? -1;
    if (matchIndex < 0) {
      continue;
    }

    const firstQuoteIdx = full.search(/["']/);
    if (firstQuoteIdx < 0) {
      continue;
    }

    const valueStart = matchIndex + firstQuoteIdx + 1;
    const valueEnd = valueStart + attrValue.length;
    if (offset < valueStart || offset > valueEnd) {
      continue;
    }

    const literals = scanQuotedLiterals(attrValue);
    for (const lit of literals) {
      const litText = lit.content;
      const litContentStartInValue = lit.start + 1;
      const litContentEndInValue = lit.end;
      const litContentStart = valueStart + litContentStartInValue;
      const litContentEnd = valueStart + litContentEndInValue;
      if (offset < litContentStart || offset > litContentEnd) {
        continue;
      }

      // Key literal: `'padding': ...`
      const afterLiteral = attrValue.slice(lit.end + 1);
      const nextSigAfter = afterLiteral.match(/\S/)?.[0];
      if (nextSigAfter === ':') {
        const fallback = getWordTokenSpan(litText, offset - litContentStart);
        if (!fallback) {
          return undefined;
        }
        return {
          range: lsp.Range.create(
            offsetToLspPosition(scriptInfo, litContentStart + fallback.start),
            offsetToLspPosition(scriptInfo, litContentStart + fallback.end),
          ),
        };
      }

      // Value literal: find nearest preceding key in object literal text.
      const beforeLiteral = attrValue.slice(0, lit.start);
      const keyMatch = beforeLiteral.match(/(["'])([^"']+)\1\s*:\s*$/);
      if (!keyMatch || /\r|\n/.test(litText)) {
        return undefined;
      }
      const cssProp = keyMatch[2];

      const cssSnippet = `a{${cssProp}:${litText};}`;
      const snippetValueStart = 2 + cssProp.length + 1;
      const cssOffset = snippetValueStart + (offset - litContentStart);
      const cssDoc = TextDocument.create(
        'inmemory://angular-style-map.scss',
        'scss',
        0,
        cssSnippet,
      );
      const stylesheet = scssLS.parseStylesheet(cssDoc);
      const cssChain = scssLS.getSelectionRanges(
        cssDoc,
        [cssDoc.positionAt(cssOffset)],
        stylesheet,
      )[0];

      const mapped = mapCssChainToOriginal(
        scriptInfo,
        cssChain,
        snippetValueStart,
        snippetValueStart + litText.length,
        litContentStart,
      );
      if (mapped) {
        return mapped;
      }

      const fallback = getWordTokenSpan(litText, offset - litContentStart);
      if (!fallback) {
        return undefined;
      }
      return {
        range: lsp.Range.create(
          offsetToLspPosition(scriptInfo, litContentStart + fallback.start),
          offsetToLspPosition(scriptInfo, litContentStart + fallback.end),
        ),
      };
    }
  }

  return undefined;
}

function scanQuotedLiterals(
  value: string,
): Array<{quote: string; start: number; end: number; content: string}> {
  const result: Array<{quote: string; start: number; end: number; content: string}> = [];

  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch !== `"` && ch !== `'`) {
      continue;
    }

    const quote = ch;
    const start = i;
    let end = -1;
    for (let j = i + 1; j < value.length; j++) {
      if (value[j] === quote && value[j - 1] !== '\\') {
        end = j;
        break;
      }
    }

    if (end >= 0) {
      result.push({quote, start, end, content: value.slice(start + 1, end)});
      i = end;
    }
  }

  return result;
}

function findInnerQuotedLiteral(
  attrValue: string,
  offsetInAttrValue: number,
): {contentStart: number; content: string; cursorInContent: number} | undefined {
  const quoteChars = [`'`, `"`];
  for (let i = 0; i < attrValue.length; i++) {
    if (!quoteChars.includes(attrValue[i])) {
      continue;
    }
    const q = attrValue[i];
    for (let j = i + 1; j < attrValue.length; j++) {
      if (attrValue[j] === q && attrValue[j - 1] !== '\\') {
        if (offsetInAttrValue >= i + 1 && offsetInAttrValue <= j) {
          return {
            contentStart: i + 1,
            content: attrValue.slice(i + 1, j),
            cursorInContent: offsetInAttrValue - (i + 1),
          };
        }
        break;
      }
    }
  }
  return undefined;
}

function mapCssChainToOriginal(
  scriptInfo: any,
  cssChain: lsp.SelectionRange | undefined,
  snippetValueStart: number,
  snippetValueEnd: number,
  originalContentStart: number,
): lsp.SelectionRange | undefined {
  const map = (current: lsp.SelectionRange | undefined): lsp.SelectionRange | undefined => {
    if (!current) {
      return undefined;
    }
    const start = current.range.start.character;
    const end = current.range.end.character;
    const mappedParent = map(current.parent);

    if (start < snippetValueStart || end > snippetValueEnd || end <= start) {
      return mappedParent;
    }

    const mappedStart = originalContentStart + (start - snippetValueStart);
    const mappedEnd = originalContentStart + (end - snippetValueStart);
    return {
      range: lsp.Range.create(
        offsetToLspPosition(scriptInfo, mappedStart),
        offsetToLspPosition(scriptInfo, mappedEnd),
      ),
      parent: mappedParent,
    };
  };

  return map(cssChain);
}

function offsetToLspPosition(scriptInfo: any, offset: number): lsp.Position {
  const loc = scriptInfo.positionToLineOffset(offset);
  return lsp.Position.create(loc.line - 1, loc.offset - 1);
}

function getWordTokenSpan(
  content: string,
  cursor: number,
): {start: number; end: number} | undefined {
  if (cursor < 0 || cursor > content.length) {
    return undefined;
  }
  const isWord = (ch: string) => /[A-Za-z0-9_-]/.test(ch);

  let i = cursor;
  if (i >= content.length || !isWord(content[i])) {
    if (i > 0 && isWord(content[i - 1])) {
      i = i - 1;
    } else {
      return undefined;
    }
  }

  let start = i;
  let end = i + 1;
  while (start > 0 && isWord(content[start - 1])) start--;
  while (end < content.length && isWord(content[end])) end++;
  return {start, end};
}

function rangeLength(scriptInfo: any, range: lsp.Range): number {
  const span = rangeToOffsetSpan(scriptInfo, range);
  return span.end - span.start;
}

function rangeToOffsetSpan(scriptInfo: any, range: lsp.Range): {start: number; end: number} {
  return {
    start: lspPositionToTsPosition(scriptInfo, range.start),
    end: lspPositionToTsPosition(scriptInfo, range.end),
  };
}

function containsOffset(span: {start: number; end: number}, offset: number): boolean {
  return span.start <= offset && offset <= span.end;
}

function containsRange(outer: lsp.Range, inner: lsp.Range): boolean {
  if (outer.start.line > inner.start.line || outer.end.line < inner.end.line) {
    return false;
  }
  if (outer.start.line === inner.start.line && outer.start.character > inner.start.character) {
    return false;
  }
  if (outer.end.line === inner.end.line && outer.end.character < inner.end.character) {
    return false;
  }
  return true;
}

function rangesEqual(a: lsp.Range, b: lsp.Range): boolean {
  return (
    a.start.line === b.start.line &&
    a.start.character === b.start.character &&
    a.end.line === b.end.line &&
    a.end.character === b.end.character
  );
}

function getOutermost(range: lsp.SelectionRange): lsp.SelectionRange {
  let current = range;
  while (current.parent) {
    current = current.parent;
  }
  return current;
}

function getTopmostInside(
  range: lsp.SelectionRange,
  outer: lsp.Range,
): lsp.SelectionRange | undefined {
  if (!containsRange(outer, range.range)) {
    return undefined;
  }

  let top = range;
  while (
    top.parent &&
    containsRange(outer, top.parent.range) &&
    !rangesEqual(outer, top.parent.range)
  ) {
    top = top.parent;
  }
  return top;
}

/**
 * Convert a TypeScript SelectionRange to an LSP SelectionRange.
 */
function convertSelectionRange(
  tsRange: {
    textSpan: {start: number; length: number};
    parent?: {textSpan: {start: number; length: number}; parent?: any};
  },
  scriptInfo: any,
): lsp.SelectionRange | undefined {
  const range = tsTextSpanToLspRange(scriptInfo, tsRange.textSpan);
  if (!range) {
    return undefined;
  }

  let parent: lsp.SelectionRange | undefined;
  if (tsRange.parent) {
    parent = convertSelectionRange(tsRange.parent, scriptInfo);
  }

  return {
    range,
    parent,
  };
}
