/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {ImportedSymbolsTracker} from '../src/ngtsc/imports';
export {TypeScriptReflectionHost} from '../src/ngtsc/reflection';
export {getInitializerApiJitTransform} from '../src/ngtsc/transform/jit';

export {
  initMockFileSystem,
  MockFileSystem,
  MockFileSystemNative,
  runInEachFileSystem,
} from '../src/ngtsc/file_system/testing';

export {MockLogger} from '../src/ngtsc/logging/testing';
export {loadTestDirectory, loadStandardTestFiles, getCachedSourceFile} from '../src/ngtsc/testing';
export {NgCompilerOptions} from '../src/ngtsc/core';
