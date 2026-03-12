/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {NgtscCompilerHost} from './src/compiler_host';
export {
  absoluteFrom,
  absoluteFromSourceFile,
  basename,
  dirname,
  getFileSystem,
  isLocalRelativePath,
  isRoot,
  isRooted,
  join,
  relative,
  relativeFrom,
  resolve,
  setFileSystem,
  toRelativeImport,
} from './src/helpers';
export {LogicalFileSystem, LogicalProjectPath} from './src/logical';
export {NodeJSFileSystem} from './src/node_js_file_system';
export {
  AbsoluteFsPath,
  FileStats,
  FileSystem,
  PathManipulation,
  PathSegment,
  PathString,
  ReadonlyFileSystem,
} from './src/types';
export {getSourceFileOrError} from './src/util';
export {createFileSystemTsReadDirectoryFn} from './src/ts_read_directory';
export {InvalidFileSystem} from './src/invalid_file_system';
