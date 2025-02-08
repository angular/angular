/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="node" />

export {ShimAdapter} from './src/adapter';
export {
  copyFileShimData,
  isShim,
  retagAllTsFiles,
  retagTsFile,
  sfExtensionData,
  untagAllTsFiles,
  untagTsFile,
} from './src/expando';
export {ShimReferenceTagger} from './src/reference_tagger';
