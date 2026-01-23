/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {SignalNode} from './signal';

function defaultThrowError(): never {
  throw new Error();
}

let throwInvalidWriteToSignalErrorFn: <T>(node: SignalNode<T>) => never = defaultThrowError;

export function throwInvalidWriteToSignalError<T>(node: SignalNode<T>) {
  throwInvalidWriteToSignalErrorFn(node);
}

export function setThrowInvalidWriteToSignalError(fn: <T>(node: SignalNode<T>) => never): void {
  throwInvalidWriteToSignalErrorFn = fn;
}
