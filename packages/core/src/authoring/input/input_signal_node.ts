/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SIGNAL_NODE, SignalNode, signalSetFn} from '@angular/core/primitives/signals';

export const REQUIRED_UNSET_VALUE = /* @__PURE__ */ Symbol('InputSignalNode#UNSET');

/**
 * Reactive node type for an input signal. An input signal extends a signal.
 * There are special properties to enable transforms and required inputs.
 */
export interface InputSignalNode<ReadT, WriteT> extends SignalNode<ReadT> {
  /**
   * User-configured transform that will run whenever a new value is applied
   * to the input signal node.
   */
  transformFn: ((value: WriteT) => ReadT)|undefined;

  /**
   * Applies a new value to the input signal. Expects transforms to be run
   * manually before.
   *
   * This function is called by the framework runtime code whenever a binding
   * changes. The value can in practice be anything at runtime, but for typing
   * purposes we assume it's a valid `ReadT` value. Type-checking will enforce that.
   */
  applyValueToInputSignal<ReadT, WriteT>(node: InputSignalNode<ReadT, WriteT>, value: ReadT): void;
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const INPUT_SIGNAL_NODE: InputSignalNode<unknown, unknown> = /* @__PURE__ */ (() => {
  return {
    ...SIGNAL_NODE,
    transformFn: undefined,

    applyValueToInputSignal<ReadT, WriteT>(node: InputSignalNode<ReadT, WriteT>, value: ReadT) {
      signalSetFn(node, value);
    }
  };
})();
