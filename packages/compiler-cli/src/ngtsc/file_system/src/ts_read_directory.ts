/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// We use TypeScript's native `ts.matchFiles` utility for the virtual file systems
// and their TypeScript compiler host `readDirectory` implementation. TypeScript's
// function implements complex logic for matching files with respect to root
// directory, extensions, excludes, includes etc. The function is currently
// internal but we can use it as the API most likely will not change any time soon,
// nor does it seem like this is being made public any time soon.
// Related issue for tracking: https://github.com/microsoft/TypeScript/issues/13793.

import ts from 'typescript';
import {FileSystem} from './types';

// https://github.com/microsoft/TypeScript/blob/b397d1fd4abd0edef85adf0afd91c030bb0b4955/src/compiler/utilities.ts#L6192
declare module 'typescript' {
  export interface FileSystemEntries {
    readonly files: readonly string[];
    readonly directories: readonly string[];
  }

  export const matchFiles:
    | undefined
    | ((
        path: string,
        extensions: readonly string[] | undefined,
        excludes: readonly string[] | undefined,
        includes: readonly string[] | undefined,
        useCaseSensitiveFileNames: boolean,
        currentDirectory: string,
        depth: number | undefined,
        getFileSystemEntries: (path: string) => FileSystemEntries,
        realpath: (path: string) => string,
        directoryExists: (path: string) => boolean,
      ) => string[]);
}

/**
 * Creates a {@link ts.CompilerHost#readDirectory} implementation function,
 * that leverages the specified file system (that may be e.g. virtual).
 */
export function createFileSystemTsReadDirectoryFn(
  fs: FileSystem,
): NonNullable<ts.CompilerHost['readDirectory']> {
  if (ts.matchFiles === undefined) {
    throw Error(
      'Unable to read directory in configured file system. This means that ' +
        'TypeScript changed its file matching internals.\n\nPlease consider downgrading your ' +
        'TypeScript version, and report an issue in the Angular framework repository.',
    );
  }

  const matchFilesFn = ts.matchFiles.bind(ts);

  return (
    rootDir: string,
    extensions: string[],
    excludes: string[] | undefined,
    includes: string[],
    depth?: number,
  ): string[] => {
    const directoryExists = (p: string) => {
      const resolvedPath = fs.resolve(p);
      return fs.exists(resolvedPath) && fs.stat(resolvedPath).isDirectory();
    };

    return matchFilesFn(
      rootDir,
      extensions,
      excludes,
      includes,
      fs.isCaseSensitive(),
      fs.pwd(),
      depth,
      (p) => {
        const resolvedPath = fs.resolve(p);

        // TS also gracefully returns an empty file set.
        if (!directoryExists(resolvedPath)) {
          return {directories: [], files: []};
        }

        const children = fs.readdir(resolvedPath);
        const files: string[] = [];
        const directories: string[] = [];

        for (const child of children) {
          if (fs.stat(fs.join(resolvedPath, child))?.isDirectory()) {
            directories.push(child);
          } else {
            files.push(child);
          }
        }

        return {files, directories};
      },
      (p) => fs.resolve(p),
      (p) => directoryExists(p),
    );
  };
}
