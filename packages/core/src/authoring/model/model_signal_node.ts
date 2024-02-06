/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SIGNAL_NODE, SignalNode, signalSetFn} from '@angular/core/primitives/signals';

export const REQUIRED_UNSET_VALUE = /* @__PURE__ */ Symbol('ModelSignalNode#UNSET');

/**
 * Reactive node type for a model signal. Model signals extend
 * signals by adding the ability to track subscriptions and to be required.
 */
export interface ModelSignalNode<T> extends SignalNode<T> {
  /** Used by the runtime to write a value to the signal input. */
  applyValueToInputSignal: (node: ModelSignalNode<T>, value: T) => void;
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const MODEL_SIGNAL_NODE: ModelSignalNode<unknown> = /* @__PURE__ */ (() => {
  return {
    ...SIGNAL_NODE,

    // TODO(crisbeto): figure out how to avoid this.
    // Maybe set an input flag that the value is writeable?
    applyValueToInputSignal: <T>(node: ModelSignalNode<T>, value: T) => signalSetFn(node, value)
  };
})();
