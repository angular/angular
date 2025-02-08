/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {dirname, relative, resolve, toRelativeImport} from '../../file_system';
import {stripExtension} from '../../file_system/src/util';
import ts from 'typescript';

export function relativePathBetween(from: string, to: string): string | null {
  const relativePath = stripExtension(relative(dirname(resolve(from)), resolve(to)));
  return relativePath !== '' ? toRelativeImport(relativePath) : null;
}

export function normalizeSeparators(path: string): string {
  // TODO: normalize path only for OS that need it.
  return path.replace(/\\/g, '/');
}

/**
 * Attempts to generate a project-relative path for a file.
 * @param fileName Absolute path to the file.
 * @param rootDirs Root directories of the project.
 * @param compilerHost Host used to resolve file names.
 * @returns
 */
export function getProjectRelativePath(
  fileName: string,
  rootDirs: readonly string[],
  compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
): string | null {
  // Note: we need to pass both the file name and the root directories through getCanonicalFileName,
  // because the root directories might've been passed through it already while the source files
  // definitely have not. This can break the relative return value, because in some platforms
  // getCanonicalFileName lowercases the path.
  const filePath = compilerHost.getCanonicalFileName(fileName);

  for (const rootDir of rootDirs) {
    const rel = relative(compilerHost.getCanonicalFileName(rootDir), filePath);
    if (!rel.startsWith('..')) {
      return rel;
    }
  }

  return null;
}
