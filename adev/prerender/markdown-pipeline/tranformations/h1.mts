/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GITHUB_EDIT_CONTENT_URL} from '../constants.mjs';
import {DocumentType, getCurrentParsedDocumentType, getCurrentParsedFilePath} from '../state.mjs';

export function transformH1(text: string) {
  // For tutorials pages, we don't have to display docs-breadcrumb
  return `
  <!-- Document Header -->
  <header class="docs-header">
    ${
      getCurrentParsedDocumentType() === DocumentType.TUTORIAL
        ? ''
        : '<docs-breadcrumb></docs-breadcrumb>'
    }

    ${getPageTitle(text)}
  </header>
  `;
}

// TODO: Add back pencil icon once code is open sourced
export function getPageTitle(text: string): string {
  return `
  <!-- Page title -->
  <div class="docs-page-title">
    <h1 tabindex="-1">${text}</h1>
    <a class="docs-github-links" target="_blank" href="${GITHUB_EDIT_CONTENT_URL}/${getCurrentParsedFilePath()}" title="Edit this page" aria-label="Edit this page">
      <!-- Pencil -->
      <!-- <docs-icon role="presentation">edit</docs-icon> -->
    </a>
  </div>`;
}
