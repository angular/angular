/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type, ɵRuntimeError as RuntimeError, ɵstringify as stringify} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

export function invalidPipeArgumentError(type: Type<any>, value: Object) {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_PIPE_ARGUMENT,
    ngDevMode && `InvalidPipeArgument: '${value}' for pipe '${stringify(type)}'`,
  );
}
