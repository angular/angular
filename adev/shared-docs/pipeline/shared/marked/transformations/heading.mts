/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens} from 'marked';
import {getHeaderId} from '../state.mjs';
import {AdevDocsRenderer} from '../renderer.mjs';

export function headingRender(this: AdevDocsRenderer, {depth, tokens}: Tokens.Heading): string {
  const text = this?.parser.parseInline(tokens);
  return formatHeading({text, depth}, this.context.markdownFilePath);
}

export function formatHeading(
  {text, depth}: {text: string; depth: number},
  markdownFilePath?: string,
): string {
  if (depth === 1) {
    return `
    <header class="docs-header">
      <docs-breadcrumb></docs-breadcrumb>

      ${getPageTitle(text, markdownFilePath)}
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

// TODO(josephperrott): Set edit content url based on the owner, repo and branch.

/** The base url for edting the a file in the repository. */
const GITHUB_EDIT_CONTENT_URL = 'https://github.com/angular/angular/edit/main';

/** Get the page title with edit button to modify the page source. */
export function getPageTitle(text: string, filePath?: string): string {
  return `
  <!-- Page title -->
  <div class="docs-page-title">
    <h1 tabindex="-1">${text}</h1>
    ${
      filePath
        ? `<a class="docs-github-links" target="_blank" href="${GITHUB_EDIT_CONTENT_URL}/${filePath}" title="Edit this page" aria-label="Edit this page">
      <!-- Pencil -->
      <docs-icon role="presentation">edit</docs-icon>
    </a>`
        : ''
    }
  </div>`;
}
