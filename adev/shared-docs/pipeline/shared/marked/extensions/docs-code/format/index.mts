/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens} from 'marked';
import {DiffMetadata, calculateDiff} from './diff.mjs';
import {highlightCode} from './highlight.mjs';
import {extractRegions} from './region.mjs';
import {JSDOM} from 'jsdom';
import {expandRangeStringValues} from './range.mjs';
import {ApiEntries, getSymbolUrl} from '../../../../linking.mjs';
import {RendererContext} from '../../../renderer.mjs';

/** Marked token for a custom docs element. */
export interface CodeToken extends Tokens.Generic {
  /* Nested code OR the code from the optional file path */
  code: string;
  /* Code language */
  language: string | undefined;

  /* The example file path */
  path?: string;
  /* The example display header */
  header?: string;
  /* Whether styling should include line numbers */
  linenums?: boolean;
  /* The example path to determine diff (lines added/removed) */
  diff?: string;
  /* The lines viewable in collapsed view */
  visibleLines?: string;
  /* The name of the viewable region in the collapsed view */
  visibleRegion?: string;
  /* Whether we should display preview */
  preview?: boolean;
  /** Whether to hide code example by default. */
  hideCode?: boolean;
  /* The lines to display highlighting on */
  highlight?: string;

  /** The generated diff metadata if created in the code formatting process. */
  diffMetadata?: DiffMetadata;

  // additional classes for the element
  classes?: string[];
}

export function formatCode(token: CodeToken, context: RendererContext): string {
  if (token.visibleLines !== undefined && token.visibleRegion !== undefined) {
    throw Error('Cannot define visible lines and visible region at the same time');
  }

  extractRegions(token);
  calculateDiff(token);
  highlightCode(context.highlighter, token);

  const containerEl = JSDOM.fragment(`
  <div class="docs-code">
    ${buildHeaderElement(token)}
    ${token.code}
  </div>
  `).firstElementChild!;

  applyContainerAttributesAndClasses(containerEl, token);
  processForApiLinks(containerEl, context.apiEntries ?? {});

  return containerEl.outerHTML;
}

/**
 * Process a DOM element to find spans (created by Shiki) and converts them to API links if they match entries.
 * This function now handles multiple symbols in the same span, ensuring all API-eligible symbols are linked.
 */
export function processForApiLinks(fragment: Element, apiEntries: ApiEntries): void {
  const spans = fragment.querySelectorAll('span:not(:has(span))');

  spans.forEach((span) => {
    const textContent = span.textContent;
    if (!textContent) return;

    // Match all valid JavaScript/TypeScript identifiers in the text
    // This regex matches identifiers that start with a letter, underscore, or dollar sign
    // and are followed by letters, digits, underscores, or dollar signs
    const identifierRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    const matches: Array<{symbol: string; index: number; length: number}> = [];
    let match;

    // Collect all identifier matches
    while ((match = identifierRegex.exec(textContent)) !== null) {
      matches.push({
        symbol: match[1],
        index: match.index,
        length: match[1].length,
      });
    }

    // If no matches found, return early
    if (matches.length === 0) return;

    // Check which symbols have API entries and need to be linked
    const symbolsToLink = matches.filter((m) => getSymbolUrl(m.symbol, apiEntries) !== undefined);

    // If no symbols need linking, return early
    if (symbolsToLink.length === 0) return;

    // Clear the span and rebuild it with links
    span.textContent = '';

    let lastIndex = 0;
    for (const match of symbolsToLink) {
      // Add text before the symbol
      if (match.index > lastIndex) {
        span.append(fragment.ownerDocument!.createTextNode(textContent.substring(lastIndex, match.index)));
      }

      // Add the linked symbol
      const apiLink = getSymbolUrl(match.symbol, apiEntries);
      if (apiLink) {
        const linkElement = fragment.ownerDocument!.createElement('a');
        linkElement.href = apiLink;
        linkElement.textContent = match.symbol;
        span.appendChild(linkElement);
      } else {
        // Fallback: add as text if somehow the link is not available
        span.append(fragment.ownerDocument!.createTextNode(match.symbol));
      }

      lastIndex = match.index + match.length;
    }

    // Add remaining text after the last symbol
    if (lastIndex < textContent.length) {
      span.append(fragment.ownerDocument!.createTextNode(textContent.substring(lastIndex)));
    }
  });
}

/** Build the header element if a header is provided in the token. */
function buildHeaderElement(token: CodeToken) {
  return token.header ? `<div class="docs-code-header"><h3>${token.header}</h3></div>` : '';
}

function applyContainerAttributesAndClasses(el: Element, token: CodeToken) {
  // Attributes
  // String value attributes
  if (token.diff) {
    el.setAttribute('path', token.diff);
  }
  if (token.path) {
    el.setAttribute('path', token.path);
  }
  if (token.visibleLines) {
    el.setAttribute('visibleLines', expandRangeStringValues(token.visibleLines).toString());
  }
  if (token.header) {
    el.setAttribute('header', token.header);
  }

  // Boolean value attributes
  if (token.preview) {
    el.setAttribute('preview', 'true');
  }
  if (token.hideCode) {
    el.setAttribute('hideCode', 'true');
  }

  const language = token.language;

  if (language === 'mermaid') {
    el.setAttribute('mermaid', 'true');
  }

  // Classes
  if (language === 'shell' || language === 'bash') {
    el.classList.add('shell');
  }

  if (token.classes) {
    el.classList.add(...token.classes);
  }
}
