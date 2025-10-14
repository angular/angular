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
  consumerDestroy,
  consumerMarkDirty,
  consumerPollProducersForChange,
  isInNotificationPhase,
  REACTIVE_NODE,
  SIGNAL,
} from './graph';
export function createWatch(fn, schedule, allowSignalWrites) {
  const node = Object.create(WATCH_NODE);
  if (allowSignalWrites) {
    node.consumerAllowSignalWrites = true;
  }
  node.fn = fn;
  node.schedule = schedule;
  const registerOnCleanup = (cleanupFn) => {
    node.cleanupFn = cleanupFn;
  };
  function isWatchNodeDestroyed(node) {
    return node.fn === null && node.schedule === null;
  }
  function destroyWatchNode(node) {
    if (!isWatchNodeDestroyed(node)) {
      consumerDestroy(node); // disconnect watcher from the reactive graph
      node.cleanupFn();
      // nullify references to the integration functions to mark node as destroyed
      node.fn = null;
      node.schedule = null;
      node.cleanupFn = NOOP_CLEANUP_FN;
    }
  }
  const run = () => {
    if (node.fn === null) {
      // trying to run a destroyed watch is noop
      return;
    }
    if (isInNotificationPhase()) {
      throw new Error(
        typeof ngDevMode !== 'undefined' && ngDevMode
          ? 'Schedulers cannot synchronously execute watches while scheduling.'
          : '',
      );
    }
    node.dirty = false;
    if (node.version > 0 && !consumerPollProducersForChange(node)) {
      return;
    }
    node.version++;
    const prevConsumer = consumerBeforeComputation(node);
    try {
      node.cleanupFn();
      node.cleanupFn = NOOP_CLEANUP_FN;
      node.fn(registerOnCleanup);
    } finally {
      consumerAfterComputation(node, prevConsumer);
    }
  };
  node.ref = {
    notify: () => consumerMarkDirty(node),
    run,
    cleanup: () => node.cleanupFn(),
    destroy: () => destroyWatchNode(node),
    [SIGNAL]: node,
  };
  return node.ref;
}
const NOOP_CLEANUP_FN = () => {};
// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `COMPUTED_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
const WATCH_NODE = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    consumerIsAlwaysLive: true,
    consumerAllowSignalWrites: false,
    consumerMarkedDirty: (node) => {
      if (node.schedule !== null) {
        node.schedule(node.ref);
      }
    },
    cleanupFn: NOOP_CLEANUP_FN,
  };
})();
//# sourceMappingURL=watch.js.map
