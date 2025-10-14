/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { SignalNode } from './signal';
export declare function throwInvalidWriteToSignalError<T>(node: SignalNode<T>): void;
export declare function setThrowInvalidWriteToSignalError(fn: <T>(node: SignalNode<T>) => never): void;
