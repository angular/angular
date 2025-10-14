/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵRuntimeError as RuntimeError, ɵstringify as stringify} from '@angular/core';
export function invalidPipeArgumentError(type, value) {
  return new RuntimeError(
    2100 /* RuntimeErrorCode.INVALID_PIPE_ARGUMENT */,
    ngDevMode && `InvalidPipeArgument: '${value}' for pipe '${stringify(type)}'`,
  );
}
//# sourceMappingURL=invalid_pipe_argument_error.js.map
