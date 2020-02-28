/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export {CachedFileSystem} from './src/cached_file_system';
export {NgtscCompilerHost} from './src/compiler_host';
export {absoluteFrom, absoluteFromSourceFile, basename, dirname, getFileSystem, isRoot, join, relative, relativeFrom, resolve, setFileSystem} from './src/helpers';
export {LogicalFileSystem, LogicalProjectPath} from './src/logical';
export {NodeJSFileSystem} from './src/node_js_file_system';
export {AbsoluteFsPath, FileStats, FileSystem, PathSegment, PathString} from './src/types';
export {getSourceFileOrError} from './src/util';
