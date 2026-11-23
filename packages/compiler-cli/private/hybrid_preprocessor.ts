/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {ErrorCode} from '../src/ngtsc/diagnostics/src/error_code';
export {validateAndRewriteCoreSymbol} from '../src/ngtsc/imports/src/core_symbols';

// TODO(crisbeto): temporary re-export until we update the preprocessor.
export {
  extractHmrDependenciesFromOutput,
  PotentialTopLevelReadsVisitor,
  type HmrCompiledOutput,
  type HmrDependencies,
  type HmrReadResolver,
} from '@angular/compiler';
