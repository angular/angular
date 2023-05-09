/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InputSignal, InputSignalNode} from './input_signal';
import {WritableSignal} from './signal';

/**
 * A `Signal` representing a component or directive model input.
 *
 * Model inputs also have the `WritableSignal` interface for their WriteTer side.
 */
export type ModelSignal<ReadT, WriteT> =
    InputSignal<ReadT, WriteT>&Pick<WritableSignal<WriteT>, 'set'|'update'>;

export interface ModelSignalNode<ReadT, WriteT> extends InputSignalNode<ReadT, WriteT> {}
