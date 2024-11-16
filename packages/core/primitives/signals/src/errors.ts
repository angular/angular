/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

function defaultThrowError(): never {
  throw new Error();
}

let throwInvalidWriteToSignalErrorFn = defaultThrowError;

export function throwInvalidWriteToSignalError() {
  throwInvalidWriteToSignalErrorFn();
}

export function setThrowInvalidWriteToSignalError(fn: () => never): void {
  throwInvalidWriteToSignalErrorFn = fn;
}
