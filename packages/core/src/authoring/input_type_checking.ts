/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InputSignal} from './input_signal';

export type ɵUnwrapInputSignalWriteType<Field> =
    Field extends InputSignal<unknown, infer WriteT>? WriteT : never;

export type ɵUnwrapDirectiveSignalInputs<Dir, Fields extends keyof Dir> = {
  [P in Fields]: ɵUnwrapInputSignalWriteType<Dir[P]>
};
