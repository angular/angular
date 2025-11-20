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
 * Check if a span element represents a comment based on Shiki's styling.
 * Comments in Shiki are typically styled with a gray color (#6A737D).
 */
function isCommentSpan(span: Element): boolean {
  const style = span.getAttribute('style') ?? '';

  // Check for Shiki comment color (#6A737D) which is used for both light and dark themes
  if (style.includes('#6A737D') || style.includes('#6a737d')) {
    return true;
  }

  // Additional check for other common comment indicators
  const className = span.getAttribute('class') ?? '';
  return className.includes('comment');
}

/**
 * Process a DOM element to find spans (created by Shiki) and converts them to API links if they match entries.
 */
export function processForApiLinks(fragment: Element, apiEntries: ApiEntries): void {
  const doc = fragment.ownerDocument;
  if (!doc) return;

  const spans = fragment.querySelectorAll('span:not(:has(span))');

  spans.forEach((span) => {
    // Skip comment spans - we don't want to create links in comments
    if (isCommentSpan(span)) {
      return;
    }

    const text = span.textContent ?? '';
    const regex = /[\w$]+/g;
    let match;
    const documentFragment = doc.createDocumentFragment();
    let lastIndex = 0;
    let hasLinks = false;

    // Find all word sequences in the span text
    while ((match = regex.exec(text)) !== null) {
      const symbol = match[0];
      const apiLink = getSymbolUrl(symbol, apiEntries);

      if (apiLink) {
        // Add text before this symbol (includes any non-linkable symbols)
        if (match.index > lastIndex) {
          documentFragment.appendChild(doc.createTextNode(text.substring(lastIndex, match.index)));
        }

        // Create a link for this symbol
        const linkElement = doc.createElement('a');
        linkElement.href = apiLink;
        linkElement.textContent = symbol;
        documentFragment.appendChild(linkElement);
        hasLinks = true;
        lastIndex = regex.lastIndex;
      }
    }

    // Only modify the span if we found at least one link
    if (hasLinks) {
      // Add any remaining text after the last link
      if (lastIndex < text.length) {
        documentFragment.appendChild(doc.createTextNode(text.substring(lastIndex)));
      }

      // Replace span contents with the fragment (single DOM operation)
      span.textContent = '';
      span.appendChild(documentFragment);
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
