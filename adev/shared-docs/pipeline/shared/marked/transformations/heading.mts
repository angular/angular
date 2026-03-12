/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens} from 'marked';
import {AdevDocsRenderer} from '../renderer.mjs';
import {getIdFromHeading} from '../../heading.mjs';

export function headingRender(
  this: AdevDocsRenderer,
  {depth, tokens, text: headingText, raw}: Tokens.Heading,
): string {
  this.context.disableAutoLinking = true;
  const parsedText = this?.parser.parseInline(tokens, this);
  this.context.disableAutoLinking = false;
  if (depth === 1) {
    return `
    <header class="docs-header">
      <docs-breadcrumb></docs-breadcrumb>
      ${getPageTitle(parsedText, this.context.markdownFilePath)}
    </header>
    `;
  }

  const link = getIdFromHeading(headingText);

  // Replace code backticks and remove custom ID syntax from the displayed label
  let label = parsedText.replace(/`(.*?)`/g, '<code>$1</code>');
  label = label.replace(/{#\s*[\w-]+\s*}/g, '').trim();
  const normalizedLabel = label.replace(/<\/?code>/g, '');

  return `
  <h${depth} id="${link}">
    <a href="#${link}" class="docs-anchor" tabindex="-1" aria-label="Link to ${normalizedLabel}">${label}</a>
  </h${depth}>
  `;
}

// TODO(josephperrott): Set edit content url based on the owner, repo and branch.

/** The base url for editing the a file in the repository. */
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
