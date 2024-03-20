/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext} from '../../di';

import {createInputSignal, InputOptions, InputOptionsWithoutTransform, InputOptionsWithTransform, InputSignal, InputSignalWithTransform} from './input_signal';
import {REQUIRED_UNSET_VALUE} from './input_signal_node';

export function inputFunction<ReadT, WriteT>(
    initialValue?: ReadT,
    opts?: InputOptions<ReadT, WriteT>): InputSignalWithTransform<ReadT|undefined, WriteT> {
  ngDevMode && assertInInjectionContext(input);
  return createInputSignal(initialValue, opts);
}

export function inputRequiredFunction<ReadT, WriteT>(opts?: InputOptions<ReadT, WriteT>):
    InputSignalWithTransform<ReadT, WriteT> {
  ngDevMode && assertInInjectionContext(input);
  return createInputSignal(REQUIRED_UNSET_VALUE as never, opts);
}

/**
 * The `input` function allows declaration of inputs in directives and
 * components.
 *
 * The function exposes an API for also declaring required inputs via the
 * `input.required` function.
 *
 * @usageNotes
 * Initialize an input in your directive or component by declaring a
 * class field and initializing it with the `input()` or `input.required()`
 * function.
 *
 * ```ts
 * @Directive({..})
 * export class MyDir {
 *   firstName = input<string>();            // string|undefined
 *   lastName = input.required<string>();    // string
 *   age = input(0);                         // number
 * }
 * ```
 *
 * @developerPreview
 */
export interface InputFunction {
  /**
   * Initializes an input with an initial value. If no explicit value
   * is specified, Angular will use `undefined`.
   *
   * Consider using `input.required` for inputs that don't need an
   * initial value.
   *
   * @developerPreview
   */
  <ReadT>(): InputSignal<ReadT|undefined>;
  <ReadT>(initialValue: ReadT, opts?: InputOptionsWithoutTransform<ReadT>): InputSignal<ReadT>;
  <ReadT, WriteT>(initialValue: ReadT, opts: InputOptionsWithTransform<ReadT, WriteT>):
      InputSignalWithTransform<ReadT, WriteT>;

  /**
   * Initializes a required input.
   *
   * Users of your directive/component need to bind to this
   * input. If unset, a compile time error will be reported.
   *
   * @developerPreview
   */
  required: {
    <ReadT>(opts?: InputOptionsWithoutTransform<ReadT>): InputSignal<ReadT>;

    <ReadT, WriteT>(opts: InputOptionsWithTransform<ReadT, WriteT>):
        InputSignalWithTransform<ReadT, WriteT>;
  };
}

/**
 * The `input` function allows declaration of inputs in directives and
 * components.
 *
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
 *
 * @developerPreview
 */
export const input: InputFunction = (() => {
  // Note: This may be considered a side-effect, but nothing will depend on
  // this assignment, unless this `input` constant export is accessed. It's a
  // self-contained side effect that is local to the user facing`input` export.
  (inputFunction as any).required = inputRequiredFunction;
  return inputFunction as (typeof inputFunction&{required: typeof inputRequiredFunction});
})();
