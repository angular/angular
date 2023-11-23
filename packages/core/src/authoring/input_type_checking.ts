/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InputSignal} from './input_signal';

/** Retrieves the `WriteT` of an `InputSignal`. */
export type ɵUnwrapInputSignalWriteType<Field> =
    Field extends InputSignal<unknown, infer WriteT>? WriteT : never;

/** Unwraps all `InputSignal` class fields of the given directive. */
export type ɵUnwrapDirectiveSignalInputs<Dir, Fields extends keyof Dir> = {
  [P in Fields]: ɵUnwrapInputSignalWriteType<Dir[P]>
};
