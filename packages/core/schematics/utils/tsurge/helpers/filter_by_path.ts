/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FileSystem} from '@angular/compiler-cli';
import ts from 'typescript';

/**
 * Filters source files to only include those within the specified path.
 * Ensures directory boundaries are respected by checking for exact matches
 * or paths that start with the target path followed by a separator.
 */
export function filterSourceFilesByPath(
  sourceFiles: ts.SourceFile[],
  path: string,
  fs: FileSystem,
): ts.SourceFile[] {
  const resolvedPath = fs.resolve(path);

  if (resolvedPath === '/') {
    return sourceFiles;
  }

  return sourceFiles.filter(
    (sf) => sf.fileName.startsWith(resolvedPath + '/') || sf.fileName === resolvedPath,
  );
}
