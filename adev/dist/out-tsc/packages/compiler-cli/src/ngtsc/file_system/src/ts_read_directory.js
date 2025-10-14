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
/**
 * Creates a {@link ts.CompilerHost#readDirectory} implementation function,
 * that leverages the specified file system (that may be e.g. virtual).
 */
export function createFileSystemTsReadDirectoryFn(fs) {
  if (ts.matchFiles === undefined) {
    throw Error(
      'Unable to read directory in configured file system. This means that ' +
        'TypeScript changed its file matching internals.\n\nPlease consider downgrading your ' +
        'TypeScript version, and report an issue in the Angular framework repository.',
    );
  }
  const matchFilesFn = ts.matchFiles.bind(ts);
  return (rootDir, extensions, excludes, includes, depth) => {
    const directoryExists = (p) => {
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
        const files = [];
        const directories = [];
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
//# sourceMappingURL=ts_read_directory.js.map
