/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createSignalFromFunction} from '../../signals';

import {InputSignal, InputSignalImpl} from './input_signal';

export interface PrimaryInputOptions<ReadT, WriteT> {
  alias?: string;
  transform?: (value: WriteT) => ReadT;
}

export interface InputOptions<ReadT, WriteT> extends PrimaryInputOptions<ReadT, WriteT> {
  defaultValue?: WriteT;
  required?: boolean;
}

export function input(): InputSignal<undefined, undefined>;
export function input<T>(): InputSignal<T|undefined, T>;
export function input<T>(
    defaultValue: T&(string | number | boolean),
    opts?: PrimaryInputOptions<T, T>&{transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(
    defaultValue: WriteT&(string | number | boolean),
    opts: PrimaryInputOptions<ReadT, WriteT>): InputSignal<ReadT, WriteT>;
export function input<T>(opts: InputOptions<T, T>&
                         {required: true, transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>&
                                             {required: true}): InputSignal<ReadT, WriteT>;
export function input<T>(opts: InputOptions<T, T>&
                         {defaultValue: T, transform?: undefined}): InputSignal<T, T>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>&
                                             {defaultValue: ReadT}): InputSignal<ReadT, WriteT>;
export function input<ReadT, WriteT = ReadT>(opts: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT|undefined, WriteT>;
export function input<ReadT, WriteT>(opts?: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT, WriteT> {
  const node = new InputSignalImpl<ReadT, WriteT>(opts?.defaultValue, opts?.transform ?? null);
  return createSignalFromFunction(node, node.signal.bind(node)) as InputSignal<ReadT, WriteT>;
}
