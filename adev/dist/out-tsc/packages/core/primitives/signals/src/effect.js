/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerPollProducersForChange,
  REACTIVE_NODE,
} from './graph';
export const BASE_EFFECT_NODE = /* @__PURE__ */ (() => ({
  ...REACTIVE_NODE,
  consumerIsAlwaysLive: true,
  consumerAllowSignalWrites: true,
  dirty: true,
  kind: 'effect',
}))();
export function runEffect(node) {
  node.dirty = false;
  if (node.version > 0 && !consumerPollProducersForChange(node)) {
    return;
  }
  node.version++;
  const prevNode = consumerBeforeComputation(node);
  try {
    node.cleanup();
    node.fn();
  } finally {
    consumerAfterComputation(node, prevNode);
  }
}
//# sourceMappingURL=effect.js.map
