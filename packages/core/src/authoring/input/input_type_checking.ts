/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InputSignalWithTransform} from './input_signal';

/** Retrieves the write type of an `InputSignal` and `InputSignalWithTransform`. */
export type ɵUnwrapInputSignalWriteType<Field> =
  Field extends InputSignalWithTransform<any, infer WriteT> ? WriteT : never;

/**
 * Unwraps all `InputSignal`/`InputSignalWithTransform` class fields of
 * the given directive.
 */
export type ɵUnwrapDirectiveSignalInputs<Dir, Fields extends keyof Dir> = {
  [P in Fields]: ɵUnwrapInputSignalWriteType<Dir[P]>;
};
