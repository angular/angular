/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {producerAccessed, SIGNAL} from '@angular/core/primitives/signals';

import {Signal} from '../render3/reactivity/api';

import {INPUT_SIGNAL_NODE, InputSignalNode, REQUIRED_UNSET_VALUE} from './input_signal_node';

/**
 * Options for signal inputs.
 */
export interface InputOptions<ReadT, WriteT> {
  /** Optional public name for the input. By default, the class field name is used. */
  alias?: string;
  /**
   * Optional transform that runs whenever a new value is bound. Can be used to
   * transform the input value before the input is updated.
   *
   * The transform function can widen the type of the input. For example, consider
   * an input for `disabled`. In practice, as the component author, you want to only
   * deal with a boolean, but users may want to bind a string if they just use the
   * attribute form to bind to the input via `<my-dir input>`. A transform can then
   * handle such string values and convert them to `boolean`. See: {@link booleanAttribute}.
   */
  transform?: (v: WriteT) => ReadT;
}

/** Signal input options without the transform option. */
export type InputOptionsWithoutTransform<ReadT> =
    // Note: We still keep a notion of `transform` for auto-completion.
    Omit<InputOptions<ReadT, ReadT>, 'transform'>&{transform?: undefined};
/** Signal input options with the transform option required. */
export type InputOptionsWithTransform<ReadT, WriteT> =
    Required<Pick<InputOptions<ReadT, WriteT>, 'transform'>>&InputOptions<ReadT, WriteT>;

export const ɵINPUT_SIGNAL_BRAND_READ_TYPE = /* @__PURE__ */ Symbol();
export const ɵINPUT_SIGNAL_BRAND_WRITE_TYPE = /* @__PURE__ */ Symbol();

/**
 * `InputSignal` is represents a special `Signal` for a directive/component input.
 *
 * An input signal is similar to a non-writable signal except that it also
 * carries additional type-information for transforms, and that Angular internally
 * updates the signal whenever a new value is bound.
 */
export interface InputSignal<ReadT, WriteT = ReadT> extends Signal<ReadT> {
  [ɵINPUT_SIGNAL_BRAND_READ_TYPE]: ReadT;
  [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: WriteT;
  [SIGNAL]: InputSignalNode<ReadT, WriteT>;
}

/**
 * Creates an input signal.
 *
 * @param initialValue The initial value.
 *   Can be set to {@link REQUIRED_UNSET_VALUE} for required inputs.
 * @param options Additional options for the input. e.g. a transform, or an alias.
 */
export function createInputSignal<ReadT, WriteT>(
    initialValue: ReadT, options?: InputOptions<ReadT, WriteT>): InputSignal<ReadT, WriteT> {
  const node: InputSignalNode<ReadT, WriteT> = Object.create(INPUT_SIGNAL_NODE);

  node.value = initialValue;

  // Perf note: Always set `transformFn` here to ensure that `node` always
  // has the same v8 class shape, allowing monomorphic reads on input signals.
  node.transformFn = options?.transform;

  function inputValueFn() {
    // Record that someone looked at this signal.
    producerAccessed(node);

    if (node.value === REQUIRED_UNSET_VALUE) {
      // TODO: Use a runtime error w/ error guide.
      throw new Error('Input is required, but no value set yet.');
    }

    return node.value;
  }

  (inputValueFn as any)[SIGNAL] = node;
  return inputValueFn as InputSignal<ReadT, WriteT>;
}
