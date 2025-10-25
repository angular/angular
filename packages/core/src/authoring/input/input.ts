/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertInInjectionContext} from '../../di';

import {
  createInputSignal,
  InputOptions,
  InputOptionsWithoutTransform,
  InputOptionsWithTransform,
  InputSignal,
  InputSignalWithTransform,
} from './input_signal';
import {REQUIRED_UNSET_VALUE} from './input_signal_node';

export function inputFunction<ReadT, WriteT>(
  initialValue?: ReadT,
  opts?: InputOptions<ReadT, WriteT>,
): InputSignalWithTransform<ReadT | undefined, WriteT> {
  ngDevMode && assertInInjectionContext(input);
  return createInputSignal(initialValue, opts);
}

export function inputRequiredFunction<ReadT, WriteT = ReadT>(
  opts?: InputOptions<ReadT, WriteT>,
): InputSignalWithTransform<ReadT, WriteT> {
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
 * @publicAPI
 * @docsPrivate Ignored because `input` is the canonical API entry.
 */
export interface InputFunction {
  /**
   * Initializes an input of type `T` with an initial value of `undefined`.
   * Angular will implicitly use `undefined` as initial value.
   */
  <T>(): InputSignal<T | undefined>;
  /** Declares an input of type `T` with an explicit initial value. */
  <T>(initialValue: T, opts?: InputOptionsWithoutTransform<T>): InputSignal<T>;
  /** Declares an input of type `T|undefined` without an initial value, but with input options */
  <T>(initialValue: undefined, opts: InputOptionsWithoutTransform<T>): InputSignal<T | undefined>;
  /**
   * Declares an input of type `T` with an initial value and a transform
   * function.
   *
   * The input accepts values of type `TransformT` and the given
   * transform function will transform the value to type `T`.
   */
  <T, TransformT>(
    initialValue: T,
    opts: InputOptionsWithTransform<T, TransformT>,
  ): InputSignalWithTransform<T, TransformT>;
  /**
   * Declares an input of type `T|undefined` without an initial value and with a transform
   * function.
   *
   * The input accepts values of type `TransformT` and the given
   * transform function will transform the value to type `T|undefined`.
   */ <T, TransformT>(
    initialValue: undefined,
    opts: InputOptionsWithTransform<T | undefined, TransformT>,
  ): InputSignalWithTransform<T | undefined, TransformT>;

  /**
   * Initializes a required input.
   *
   * Consumers of your directive/component need to bind to this
   * input. If unset, a compile time error will be reported.
   *
   * @publicAPI
   */
  required: {
    /** Declares a required input of type `T`. */
    <T>(opts?: InputOptionsWithoutTransform<T>): InputSignal<T>;
    /**
     * Declares a required input of type `T` with a transform function.
     *
     * The input accepts values of type `TransformT` and the given
     * transform function will transform the value to type `T`.
     */
    <T, TransformT>(
      opts: InputOptionsWithTransform<T, TransformT>,
    ): InputSignalWithTransform<T, TransformT>;
  };
}

/**
 * The `input` function allows declaration of Angular inputs in directives
 * and components.
 *
 * There are two variants of inputs that can be declared:
 *
 *   1. **Optional inputs** with an initial value.
 *   2. **Required inputs** that consumers need to set.
 *
 * By default, the `input` function will declare optional inputs that
 * always have an initial value. Required inputs can be declared
 * using the `input.required()` function.
 *
 * Inputs are signals. The values of an input are exposed as a `Signal`.
 * The signal always holds the latest value of the input that is bound
 * from the parent.
 *
 * @usageNotes
 * To use signal-based inputs, import `input` from `@angular/core`.
 *
 * ```ts
 * import {input} from '@angular/core';
 * ```
 *
 * Inside your component, introduce a new class member and initialize
 * it with a call to `input` or `input.required`.
 *
 * ```ts
 * @Component({
 *   ...
 * })
 * export class UserProfileComponent {
 *   firstName = input<string>();             // Signal<string|undefined>
 *   lastName  = input.required<string>();    // Signal<string>
 *   age       = input(0)                     // Signal<number>
 * }
 * ```
 *
 * Inside your component template, you can display values of the inputs
 * by calling the signal.
 *
 * ```html
 * <span>{{firstName()}}</span>
 * ```
 *
 * @publicAPI
 * @initializerApiFunction
 */
export const input: InputFunction = (() => {
  // Note: This may be considered a side-effect, but nothing will depend on
  // this assignment, unless this `input` constant export is accessed. It's a
  // self-contained side effect that is local to the user facing`input` export.
  (inputFunction as any).required = inputRequiredFunction;
  return inputFunction as typeof inputFunction & {required: typeof inputRequiredFunction};
})();
