/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFileSync} from 'fs';
import {glob} from 'glob';
import {join} from 'path';

export function mapBackticksToCodeElement(text: string): string {
  return text.replaceAll(/`(.*?)`/g, '<code>$1</code>');
}

/** Recursively search the provided directory for all markdown files and asyncronously load them. */
export async function retrieveAllMarkdownFiles(
  baseDir: string,
): Promise<{path: string; content: string}[]> {
  const files = await glob('**/*.md', {
    root: baseDir,
    cwd: baseDir,
    ignore: ['**/node_modules/**'],
  });

  return files.map((filePath) => ({
    path: filePath,
    content: readFileSync(join(baseDir, filePath), {encoding: 'utf-8'}),
  }));
}
