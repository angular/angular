/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer, Tokens} from 'marked';

import {getHeaderId} from '../state.mjs';
import {getPageTitle} from '../utils.mjs';

export function headingRender(this: Renderer, {depth, tokens}: Tokens.Heading): string {
  const text = this?.parser.parseInline(tokens);
  return formatHeading({text, depth});
}

export function formatHeading({text, depth}: {text: string; depth: number}): string {
  if (depth === 1) {
    return `
    <header class="docs-header">
      <docs-breadcrumb></docs-breadcrumb>

      ${getPageTitle(text)}
    </header>
    `;
  }

  // Nested anchor elements are invalid in HTML
  // They might happen when we have a code block in a heading
  // regex aren't perfect for that but this one should be "good enough"
  const regex = /<a\s+(?:[^>]*?\s+)?href.*?>(.*?)<\/a>/gi;
  const anchorLessText = text.replace(regex, '$1');

  // extract the extended markdown heading id
  // ex:  ## MyHeading {# myId}
  const customIdRegex = /{#\s*([\w-]+)\s*}/g;
  const customId = customIdRegex.exec(anchorLessText)?.[1];
  const link = customId ?? getHeaderId(anchorLessText);
  const label = anchorLessText.replace(/`(.*?)`/g, '<code>$1</code>').replace(customIdRegex, '');

  return `
  <h${depth} id="${link}">
    <a href="#${link}" class="docs-anchor" tabindex="-1" aria-label="Link to ${label}">${label}</a>
  </h${depth}>
  `;
}
