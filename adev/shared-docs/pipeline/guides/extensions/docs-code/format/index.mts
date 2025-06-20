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

export function formatCode(token: CodeToken) {
  if (token.visibleLines !== undefined && token.visibleRegion !== undefined) {
    throw Error('Cannot define visible lines and visible region at the same time');
  }

  extractRegions(token);
  calculateDiff(token);
  highlightCode(token);

  const containerEl = JSDOM.fragment(`
  <div class="docs-code">
    ${buildHeaderElement(token)}
    <pre class="docs-mini-scroll-track">
      ${token.code}
    </pre>
  </div>
  `).firstElementChild!;

  applyContainerAttributesAndClasses(containerEl, token);

  return containerEl.outerHTML;
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
