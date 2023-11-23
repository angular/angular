/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createInputSignal, InputOptions, InputOptionsWithoutTransform, InputOptionsWithTransform, InputSignal} from './input_signal';
import {REQUIRED_UNSET_VALUE} from './input_signal_node';

/**
 * Initializes an input with an initial value. If no explicit value
 * is specified, Angular will use `undefined`.
 *
 * Consider using `input.required` for inputs that don't need an
 * initial value.
 *
 * @usageNotes
 * Initialize an input in your directive or component by declaring a
 * class field and initializing it with the `input()` function.
 *
 * ```ts
 * @Directive({..})
 * export class MyDir {
 *   firstName = input<string>();            // string|undefined
 *   lastName = input.required<string>();    // string
 *   age = input(0);                         // number
 * }
 * ```
 */
export function inputFunction<ReadT>(): InputSignal<ReadT|undefined>;
export function inputFunction<ReadT>(
    initialValue: ReadT, opts?: InputOptionsWithoutTransform<ReadT>): InputSignal<ReadT>;
export function inputFunction<ReadT, WriteT>(
    initialValue: ReadT,
    opts: InputOptionsWithTransform<ReadT, WriteT>): InputSignal<ReadT, WriteT>;
export function inputFunction<ReadT, WriteT>(
    initialValue?: ReadT,
    opts?: InputOptions<ReadT, WriteT>): InputSignal<ReadT|undefined, WriteT> {
  return createInputSignal(initialValue, opts);
}

/**
 * Initializes a required input. Users of your directive/component,
 * need to bind to this input, otherwise they will see errors.
 * *
 * @usageNotes
 * Initialize an input in your directive or component by declaring a
 * class field and initializing it with the `input()` function.
 *
 * ```ts
 * @Directive({..})
 * export class MyDir {
 *   firstName = input<string>();            // string|undefined
 *   lastName = input.required<string>();    // string
 *   age = input(0);                         // number
 * }
 * ```
 */
export function inputRequiredFunction<ReadT>(opts?: InputOptionsWithoutTransform<ReadT>):
    InputSignal<ReadT>;
export function inputRequiredFunction<ReadT, WriteT>(
    opts: InputOptionsWithTransform<ReadT, WriteT>): InputSignal<ReadT, WriteT>;
export function inputRequiredFunction<ReadT, WriteT>(opts?: InputOptions<ReadT, WriteT>):
    InputSignal<ReadT, WriteT> {
  return createInputSignal(REQUIRED_UNSET_VALUE as never, opts);
}

/**
 * Type of the `input` function.
 *
 * The input function is a special function that also provides access to
 * required inputs via the `.required` property.
 */
export type InputFunction = typeof inputFunction&{required: typeof inputRequiredFunction};

/**
 * Initializes an input with an initial value. If no explicit value
 * is specified, Angular will use `undefined`.
 *
 * Consider using `input.required` for inputs that don't need an
 * initial value.
 *
 * @usageNotes
 * Initialize an input in your directive or component by declaring a
 * class field and initializing it with the `input()` function.
 *
 * ```ts
 * @Directive({..})
 * export class MyDir {
 *   firstName = input<string>();            // string|undefined
 *   lastName = input.required<string>();    // string
 *   age = input(0);                         // number
 * }
 * ```
 */
export const input: InputFunction = (() => {
  // Note: This may be considered a side-effect, but nothing will depend on
  // this assignment, unless this `input` constant export is accessed. It's a
  // self-contained side effect that is local to the user facing`input` export.
  (inputFunction as any).required = inputRequiredFunction;
  return inputFunction as InputFunction;
})();
