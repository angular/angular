/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {SIGNAL_NODE, signalSetFn} from '../../../primitives/signals';
export const REQUIRED_UNSET_VALUE = /* @__PURE__ */ Symbol('InputSignalNode#UNSET');
// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
export const INPUT_SIGNAL_NODE = /* @__PURE__ */ (() => {
  return {
    ...SIGNAL_NODE,
    transformFn: undefined,
    applyValueToInputSignal(node, value) {
      signalSetFn(node, value);
    },
  };
})();
//# sourceMappingURL=input_signal_node.js.map
