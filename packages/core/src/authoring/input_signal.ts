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

export type InputOptions<ReadT, WriteT> = {
  alias?: string;
  transform?: (v: WriteT) => ReadT;
};

export type InputOptionsWithoutTransform<ReadT> =
    // Note: We still keep a notion of `transform` for auto-completion.
    Omit<InputOptions<ReadT, ReadT>, 'transform'>;
export type InputOptionsWithTransform<ReadT, WriteT> =
    Required<Pick<InputOptions<ReadT, WriteT>, 'transform'>>&InputOptions<ReadT, WriteT>;

export const ɵINPUT_SIGNAL_BRAND_READ_TYPE = /* @__PURE__ */ Symbol();
export const ɵINPUT_SIGNAL_BRAND_WRITE_TYPE = /* @__PURE__ */ Symbol();

/**
 * A `Signal` representing a component or directive input.
 *
 * This is equivalent to a `Signal`, except it also carries type information about the
 */
export type InputSignal<ReadT, WriteT = ReadT> = Signal<ReadT>&{
  [ɵINPUT_SIGNAL_BRAND_READ_TYPE]: ReadT;
  [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: WriteT;
  [SIGNAL]: InputSignalNode<ReadT, WriteT>;
};

/**
 * Creates an input signal.
 *
 * @param initialValue The user-specified initial value. Ignored if the input is required.
 * @param required Whether the input is required. If set, an initial value is ignored.
 * @param options Additional options for the input. e.g. a transform, or an alias.
 */
export function createInputSignal<ReadT, WriteT>(
    initialValue: ReadT, required: boolean,
    options?: InputOptions<ReadT, WriteT>): InputSignal<ReadT, WriteT> {
  const node: InputSignalNode<ReadT, WriteT> = Object.create(INPUT_SIGNAL_NODE);

  if (options?.transform !== undefined) {
    node.transformFn = options.transform;
  }

  if (required) {
    node.value = REQUIRED_UNSET_VALUE;
  } else {
    node.value = initialValue;
  }

  function inputValueFn() {
    // Record that someone looked at this signal.
    producerAccessed(node);

    if (node.value === REQUIRED_UNSET_VALUE) {
      throw new Error('Input is required, but no value set yet.');
    }

    return node.value;
  }

  (inputValueFn as any)[SIGNAL] = node;
  return inputValueFn as InputSignal<ReadT, WriteT>;
}
