/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {validateAndRewriteCoreSymbol} from '../src/ngtsc/imports/src/core_symbols';
export {
  extractHmrDependenciesFromOutput,
  PotentialTopLevelReadsVisitor,
  type HmrCompiledOutput,
  type HmrDependencies,
  type HmrReadResolver,
} from '../src/ngtsc/hmr/src/extract_dependencies_output';
