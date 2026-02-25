/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Type,
  ɵRuntimeError as RuntimeError,
  ɵstringify as stringify,
  isSignal,
} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

export function invalidPipeArgumentError(type: Type<any>, value: Object) {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_PIPE_ARGUMENT,
    ngDevMode && `InvalidPipeArgument: '${value}' for pipe '${stringify(type)}'`,
  );
}

export function warnIfSignal(pipeName: string, value: unknown): void {
  if (isSignal(value)) {
    console.warn(`The ${pipeName} does not unwrap signals. Received a signal with value:`, value());
  }
}
