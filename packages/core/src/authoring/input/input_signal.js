/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {producerAccessed, SIGNAL} from '../../../primitives/signals';
import {RuntimeError} from '../../errors';
import {INPUT_SIGNAL_NODE, REQUIRED_UNSET_VALUE} from './input_signal_node';
export const ɵINPUT_SIGNAL_BRAND_READ_TYPE = /* @__PURE__ */ Symbol();
export const ɵINPUT_SIGNAL_BRAND_WRITE_TYPE = /* @__PURE__ */ Symbol();
/**
 * Creates an input signal.
 *
 * @param initialValue The initial value.
 *   Can be set to {@link REQUIRED_UNSET_VALUE} for required inputs.
 * @param options Additional options for the input. e.g. a transform, or an alias.
 */
export function createInputSignal(initialValue, options) {
  const node = Object.create(INPUT_SIGNAL_NODE);
  node.value = initialValue;
  // Perf note: Always set `transformFn` here to ensure that `node` always
  // has the same v8 class shape, allowing monomorphic reads on input signals.
  node.transformFn = options?.transform;
  function inputValueFn() {
    // Record that someone looked at this signal.
    producerAccessed(node);
    if (node.value === REQUIRED_UNSET_VALUE) {
      let message = null;
      if (ngDevMode) {
        const name = options?.debugName ?? options?.alias;
        message = `Input${name ? ` "${name}"` : ''} is required but no value is available yet.`;
      }
      throw new RuntimeError(-950 /* RuntimeErrorCode.REQUIRED_INPUT_NO_VALUE */, message);
    }
    return node.value;
  }
  inputValueFn[SIGNAL] = node;
  if (ngDevMode) {
    inputValueFn.toString = () => `[Input Signal: ${inputValueFn()}]`;
    node.debugName = options?.debugName;
  }
  return inputValueFn;
}
//# sourceMappingURL=input_signal.js.map
