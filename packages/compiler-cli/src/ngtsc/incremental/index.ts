/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {IncrementalCompilation} from './src/incremental';
export {NOOP_INCREMENTAL_BUILD} from './src/noop';
export {
  AnalyzedIncrementalState,
  DeltaIncrementalState,
  FreshIncrementalState,
  IncrementalState,
  IncrementalStateKind,
} from './src/state';

export * from './src/strategy';
