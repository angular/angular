/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {COMPUTED_NODE, ComputedNode, UNSET} from '@angular/core/primitives/signals';

import {Signal} from './api';

export const BRAND_WRITE_TYPE = Symbol();

/**
 * A `Signal` representing a component or directive input.
 *
 * This is equivalent to a `Signal`, except it also carries type information about the
 */
export type InputSignal<ReadT, WriteT> = Signal<ReadT>&{
  [BRAND_WRITE_TYPE]: WriteT;
};

export interface InputSignalNode<ReadT, WriteT> extends ComputedNode<ReadT> {
  /**
   * Whether the input signal is initialized. If not, accessing the node results in an error.
   *
   * We support this to enable required inputs which may be set later, but should not be accessed
   * before as there is no meaningful value and this usually indicates incorrect user code.
   */
  isInitialized: boolean;

  /**
   * The computation to which the input is currently bound. An input signal is commonly
   * bound to a computation if a parent signal component binds to the input.
   */
  _boundComputation?: (() => WriteT);

  /**
   * An input signal can hold a directly bound value. This is used when e.g. Zone components
   * change input signal values.
   */
  _boundValue?: WriteT;

  bind(node: this, value: {value?: WriteT, computation?: () => WriteT}): void;

  /** Transform function that is run whenever the node value is retrieved. */
  transform: (value: WriteT) => ReadT;
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const INPUT_SIGNAL_NODE: InputSignalNode<unknown, unknown> = /* @__PURE__ */ (() => {
  return {
    ...COMPUTED_NODE,

    // Input-signal specific defaults.
    isInitialized: false,
    transform: value => value,

    // Overrides from the computed node.
    // TODO: Should we change `ComputedNode` somehow to not rely on context (seems rather brittle).
    computation: function(this: InputSignalNode<unknown, unknown>) {
      if (!this.isInitialized) {
        // TODO: Make this a proper RuntimeError
        throw new Error(`InputSignal not yet initialized`);
      }
      return this.transform(this._boundComputation?.() ?? this._boundValue);
    },

    bind: function<ReadT, WriteT>(
        node: InputSignalNode<ReadT, WriteT>, value: {value?: WriteT, computation?: () => WriteT}) {
      node._boundComputation = value.computation;
      node._boundValue = value.value;

      node.dirty = true;
      node.value = UNSET;
    },
  };
})();
