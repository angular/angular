/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export {NgtscCompilerHost} from './src/compiler_host.js';
export {absoluteFrom, absoluteFromSourceFile, basename, dirname, getFileSystem, isLocalRelativePath, isRoot, isRooted, join, relative, relativeFrom, resolve, setFileSystem, toRelativeImport} from './src/helpers.js';
export {LogicalFileSystem, LogicalProjectPath} from './src/logical.js';
export {NodeJSFileSystem} from './src/node_js_file_system.js';
export {AbsoluteFsPath, FileStats, FileSystem, PathManipulation, PathSegment, PathString, ReadonlyFileSystem} from './src/types.js';
export {getSourceFileOrError} from './src/util.js';
