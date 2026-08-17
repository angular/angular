/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BASE_EFFECT_NODE,
  BaseEffectNode,
  consumerDestroy,
  isInNotificationPhase,
  runEffect,
  setActiveConsumer,
} from '../../primitives/signals';

export type EffectCleanupFn = () => void;
export type EffectCleanupRegisterFn = (cleanupFn: EffectCleanupFn) => void;

export interface TestingEffectNode extends BaseEffectNode {
  cleanupFns: EffectCleanupFn[] | undefined;
  destroyed: boolean;
}

export const TESTING_EFFECT_NODE: Omit<TestingEffectNode, 'fn'> = /* @__PURE__ */ (() => ({
  ...BASE_EFFECT_NODE,
  cleanupFns: undefined,
  destroyed: false,
  consumerMarkedDirty(this: TestingEffectNode): void {
    if (this.destroyed) {
      return;
    }
    queue.add(this);
  },
  run(this: TestingEffectNode): void {
    if (this.destroyed) {
      return;
    }
    if (isInNotificationPhase()) {
      throw new Error('Schedulers cannot synchronously execute watches while scheduling.');
    }
    runEffect(this);
  },
  cleanup(this: TestingEffectNode): void {
    if (!this.cleanupFns?.length) {
      return;
    }
    const prevConsumer = setActiveConsumer(null);
    try {
      while (this.cleanupFns.length) {
        this.cleanupFns.pop()!();
      }
    } finally {
      this.cleanupFns = [];
      setActiveConsumer(prevConsumer);
    }
  },
  destroy(this: TestingEffectNode): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    consumerDestroy(this);
    this.cleanup();
  },
}))();

let queue = new Set<TestingEffectNode>();

export function createTestingEffect(
  effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
  onMarkedDirty?: () => void,
): TestingEffectNode {
  const node = Object.create(TESTING_EFFECT_NODE) as TestingEffectNode;
  node.fn = () => {
    effectFn((cleanupFn) => (node.cleanupFns ??= []).push(cleanupFn));
  };
  if (onMarkedDirty) {
    node.consumerMarkedDirty = function (this: TestingEffectNode) {
      if (this.destroyed) {
        return;
      }
      onMarkedDirty();
    };
  }
  return node;
}

/**
 * A wrapper around `TestingEffectNode` that emulates the `effect` API and allows for more streamlined testing.
 */
export function testingEffect(effectFn: (onCleanup: EffectCleanupRegisterFn) => void): () => void {
  const node = createTestingEffect(effectFn);

  // Effects start dirty.
  queue.add(node);

  return () => {
    queue.delete(node);
    node.destroy();
  };
}

export function flushEffects(): void {
  for (const watch of queue) {
    queue.delete(watch);
    watch.run();
  }
}

export function resetEffects(): void {
  queue.clear();
}
