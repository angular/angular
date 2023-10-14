/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {Signal} from '../render3/reactivity/api';

export const ɵBRAND_WRITE_TYPE = /* @__PURE__ */ Symbol();

/**
 * A `Signal` representing a component or directive input.
 *
 * This is equivalent to a `Signal`, except it also carries type information about the
 */
export type InputSignal<ReadT, WriteT> = Signal<ReadT>&{
  [ɵBRAND_WRITE_TYPE]: WriteT;
};

export interface PrimaryInputOptions<ReadT, WriteT> {
  alias?: string;
  transform?: (value: WriteT) => ReadT;
}

export interface InputOptions<ReadT, WriteT> extends PrimaryInputOptions<ReadT, WriteT> {
  initialValue?: WriteT;
  required?: boolean;
}

export function input(): InputSignal<undefined, undefined>;
export function input<T>(): InputSignal<T|undefined, T>;
export function input<T>(
    initialValue: T&(string | number | boolean),
    opts?: PrimaryInputOptions<T, T>&{transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(
    initialValue: WriteT&(string | number | boolean),
    opts: PrimaryInputOptions<ReadT, WriteT>): InputSignal<ReadT, WriteT>;
export function input<T>(opts: InputOptions<T, T>&
                         {required: true, transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>&
                                             {required: true}): InputSignal<ReadT, WriteT>;
export function input<T>(opts: InputOptions<T, T>&
                         {initialValue: T, transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>&
                                             {initialValue: ReadT}): InputSignal<ReadT, WriteT>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT|undefined, WriteT>;
export function input<ReadT, WriteT>(opts?: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT, WriteT> {
  throw new Error('TODO: not yet implemented');
}
