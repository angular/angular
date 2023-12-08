/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createInputSignal, InputOptions, InputOptionsWithoutTransform, InputOptionsWithTransform, InputSignal} from './input_signal';

// -------


export function ɵinput<ReadT>(): InputSignal<ReadT|undefined>;
export function ɵinput<ReadT>(
    ɵinput: ReadT, opts?: InputOptionsWithoutTransform<ReadT>): InputSignal<ReadT>;
export function ɵinput<ReadT, WriteT>(
    initialValue: ReadT,
    opts: InputOptionsWithTransform<ReadT, WriteT>): InputSignal<ReadT, WriteT>;
// impl.
export function ɵinput<ReadT, WriteT>(initialValue?: ReadT, opts?: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT|undefined, WriteT> {
  return createInputSignal(initialValue, false, opts);
}

export function ɵinputRequired<ReadT>(opts?: InputOptionsWithoutTransform<ReadT>):
    InputSignal<ReadT>;
export function ɵinputRequired<ReadT, WriteT>(opts: InputOptionsWithTransform<ReadT, WriteT>):
    InputSignal<ReadT, WriteT>;
// impl.
export function ɵinputRequired<ReadT, WriteT>(opts?: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT, WriteT> {
  return createInputSignal(undefined as never, true, opts);
}

export type InputFn = typeof ɵinput&{required: typeof ɵinputRequired};

export const input: InputFn = (() => {
  // Note: This may be considered a side-effect, but nothing will depend on
  // this assignment, unless this `input` constant export is accessed.
  (ɵinput as any).required = ɵinputRequired;
  return ɵinput as InputFn;
})();
