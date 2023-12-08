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
export interface InputSignalNode<ReadT, WriteT> extends
    SignalNode<ReadT|typeof REQUIRED_UNSET_VALUE> {
  /**
   * User-configured transform that will run whenever a new value is applied
   * to the input signal node.
   */
  transformFn?: (value: WriteT) => ReadT;

  /**
   * Applies a new value to the input signal. This is called by the framework runtime
   * code whenever a binding changes. The value can be anything- but for typing purposes
   * we can assume it's either a valid value given type-checking.
   */
  applyValueToInputSignal<ReadT, WriteT>(node: InputSignalNode<ReadT, WriteT>, value: ReadT|WriteT):
      void;
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const INPUT_SIGNAL_NODE: InputSignalNode<unknown, unknown> = /* @__PURE__ */ (() => {
  return {
    ...SIGNAL_NODE,

    applyValueToInputSignal<ReadT, WriteT>(
        node: InputSignalNode<ReadT, WriteT>, value: ReadT|WriteT): void {
      const finalValue =
          node.transformFn !== undefined ? node.transformFn(value as WriteT) : (value as ReadT);

      signalSetFn(node, finalValue);
    }
  };
})();
