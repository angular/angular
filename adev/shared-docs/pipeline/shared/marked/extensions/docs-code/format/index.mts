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
  /* Whether stling should include line numbers */
  linenums?: boolean;
  /* The example path to determine diff (lines added/removed) */
  diff?: string;
  /* The lines viewable in collapsed view */
  visibleLines?: string;
  /* The name of the viewable region in the collapsed view */
  visibleRegion?: string;
  /* Whether we should display preview */
  preview?: boolean;
  /* The lines to display highlighting on */
  highlight?: string;

  /** The generated diff metadata if created in the code formating process. */
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
 */
export function processForApiLinks(fragment: Element, apiEntries: ApiEntries): void {
  const spans = fragment.querySelectorAll('span:not(:has(span))');

  spans.forEach((span) => {
    const symbolMatch = span.textContent?.match(/^(.*?)(\w+)(.*)$/);
    if (!symbolMatch) return;

    // Yes, index 0 is not interesting for us here
    const [, before, symbol, after] = symbolMatch;

    const apiLink = getSymbolUrl(symbol, apiEntries);
    if (apiLink) {
      // Create a new link element
      const linkElement = fragment.ownerDocument!.createElement('a');
      linkElement.href = apiLink;
      linkElement.textContent = symbol;

      // Clear the span's content and insert the link as a child
      span.textContent = before;
      span.appendChild(linkElement);
      span.append(fragment.ownerDocument!.createTextNode(after));
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
  if (token.language === 'mermaid') {
    el.setAttribute('mermaid', 'true');
  }

  // Classes
  if (token.language === 'shell') {
    el.classList.add('shell');
  }

  if (token.classes) {
    el.classList.add(...token.classes);
  }
}
