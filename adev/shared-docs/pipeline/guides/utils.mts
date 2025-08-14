/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {existsSync, readFileSync} from 'fs';
import {join} from 'path';
import {cwd} from 'process';

// TODO(josephperrott): Set edit content url based on the owner, repo and branch.

/** The base url for edting the a file in the repository. */
const GITHUB_EDIT_CONTENT_URL = 'https://github.com/angular/angular/edit/main';

/** Get the page title with edit button to modify the page source. */
export function getPageTitle(text: string): string {
  return `
  <!-- Page title -->
  <div class="docs-page-title">
    <h1 tabindex="-1">${text}</h1>
    <a class="docs-github-links" target="_blank" href="${GITHUB_EDIT_CONTENT_URL}/${context?.markdownFilePath}" title="Edit this page" aria-label="Edit this page">
      <!-- Pencil -->
      <docs-icon role="presentation">edit</docs-icon>
    </a>
  </div>`;
}

/** Configuration using environment for parser, providing context. */
export interface ParserContext {
  markdownFilePath?: string;
  apiEntries?: Record<string, string>;
}

let context: ParserContext = {};
export function setContext(envContext: Partial<ParserContext>) {
  context = envContext;
}

export function getApiLink(entryName: string): string | undefined {
  if (!context.apiEntries || hasMoreThanOneDot(entryName)) {
    return undefined;
  }

  let propName: string | undefined;
  // we want to match functions when they have parentheses
  if (entryName.endsWith('()')) {
    entryName = entryName.slice(0, -2);
  }

  if (entryName.startsWith('@')) {
    entryName = entryName.slice(1);
  }
  if (entryName.includes('.')) {
    [entryName, propName] = entryName.split('.');
  }

  // We don't want to match entries like "constructor"
  const apiEntry = Object.hasOwn(context.apiEntries, entryName) && context.apiEntries[entryName];

  return apiEntry ? `/api/${apiEntry}/${entryName}${propName ? `#${propName}` : ''}` : undefined;
}

/** The base directory of the workspace the script is running in. */
const WORKSPACE_DIR = cwd();

export function loadWorkspaceRelativeFile(filePath: string): string {
  const fullFilePath = join(WORKSPACE_DIR, filePath);
  if (!existsSync(fullFilePath)) {
    throw Error(`Cannot find: ${filePath}`);
  }
  return readFileSync(fullFilePath, {encoding: 'utf-8'});
}

function hasMoreThanOneDot(str: string) {
  return str.split('.').length - 1 > 1;
}
