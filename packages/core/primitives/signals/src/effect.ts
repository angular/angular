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
  ReactiveNode,
} from './graph';

// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
declare const ngDevMode: boolean | undefined;

/**
 * An effect can, optionally, register a cleanup function. If registered, the cleanup is executed
 * before the next effect run. The cleanup function makes it possible to "cancel" any work that the
 * previous effect run might have started.
 */
export type EffectCleanupFn = () => void;

/**
 * A callback passed to the effect function that makes it possible to register cleanup logic.
 */
export type EffectCleanupRegisterFn = (cleanupFn: EffectCleanupFn) => void;

export interface BaseEffectNode extends ReactiveNode {
  hasRun: boolean;
  cleanupFn: EffectCleanupRegisterFn;
  fn: (cleanupFn: EffectCleanupRegisterFn) => void;
  destroy(): void;
  cleanup(): void;
  run(): void;
}

export const BASE_EFFECT_NODE: Omit<BaseEffectNode, 'fn' | 'destroy' | 'cleanup'> =
  /* @__PURE__ */ (() => ({
    ...REACTIVE_NODE,
    consumerIsAlwaysLive: true,
    consumerAllowSignalWrites: true,
    __dirty: true,
    hasRun: false,
    cleanupFn: () => {},
    kind: 'effect',
    run(this: BaseEffectNode): void {
      runEffect(this);
    },
  }))();

export function runEffect(node: BaseEffectNode) {
  node.__dirty = false;
  if (node.hasRun && !consumerPollProducersForChange(node)) {
    return;
  }
  node.hasRun = true;
  const prevNode = consumerBeforeComputation(node);
  try {
    node.cleanup();
    node.fn(node.cleanupFn);
  } finally {
    consumerAfterComputation(node, prevNode);
  }
}
