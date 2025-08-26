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

/** Whether the link provided is external to the application. */
export function isExternalLink(href: string | undefined | null) {
  return href?.startsWith('http') ?? false;
}

/** Provide the correct target for the anchor tag based on the link provided. */
export function anchorTarget(href: string | undefined | null) {
  return isExternalLink(href) ? ` target="_blank"` : '';
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
