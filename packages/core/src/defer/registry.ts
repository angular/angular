/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject} from '../di';
import {InjectionToken} from '../di/injection_token';
import {ɵɵdefineInjectable} from '../di/interface/defs';
import {
  EventContractDetails,
  JSACTION_EVENT_CONTRACT,
  removeListenersFromBlocks,
} from '../event_delegation_utils';
import {INITIAL_EVENT_REPLAY_STATE, JSACTION_BLOCK_ELEMENT_MAP} from '../hydration/tokens';
import {DehydratedDeferBlock} from './interfaces';
import type {PromiseWithResolvers} from '../util/promise_with_resolvers';

/**
 * An internal injection token to reference `DehydratedBlockRegistry` implementation
 * in a tree-shakable way.
 */
export const DEHYDRATED_BLOCK_REGISTRY = new InjectionToken<DehydratedBlockRegistry>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'DEHYDRATED_BLOCK_REGISTRY' : '',
);

/**
 * The DehydratedBlockRegistry is used for incremental hydration purposes. It keeps
 * track of the Defer Blocks that need hydration so we can effectively
 * navigate up to the top dehydrated defer block and fire appropriate cleanup
 * functions post hydration.
 */
export class DehydratedBlockRegistry {
  private registry = new Map<string, DehydratedDeferBlock>();
  private cleanupFns = new Map<string, Function[]>();
  private jsActionMap: Map<string, Set<Element>> = inject(JSACTION_BLOCK_ELEMENT_MAP);
  private contract: EventContractDetails = inject(JSACTION_EVENT_CONTRACT);
  private initialReplayState = inject(INITIAL_EVENT_REPLAY_STATE);

  add(blockId: string, info: DehydratedDeferBlock) {
    this.registry.set(blockId, info);
    // It's possible that hydration is queued that's waiting for the
    // resolution of a lazy loaded route. In this case, we ensure
    // the callback function is called to continue the hydration process
    // for the queued block set.
    if (this.awaitingCallbacks.has(blockId)) {
      const awaitingCallbacks = this.awaitingCallbacks.get(blockId)!;
      for (const cb of awaitingCallbacks) {
        cb();
      }
    }
  }

  get(blockId: string): DehydratedDeferBlock | null {
    return this.registry.get(blockId) ?? null;
  }

  has(blockId: string): boolean {
    return this.registry.has(blockId);
  }

  deferListenerCleanup(hydratedBlocks: string[]): void {
    // Keep jsaction/ngb attributes and stashed listeners intact while initial
    // event replay is still pending so early events on blocks that hydrate
    // before `whenStable()` are still replayed (retained until `whenStable()` or
    // `appRef.onDestroy()`, matching `EAGER_CONTENT_LISTENERS_KEY`).
    if (!this.initialReplayState.pending) {
      return;
    }
    for (const blockId of hydratedBlocks) {
      this.initialReplayState.pendingListenerCleanup.add(blockId);
    }
    this.initialReplayState.flushPendingListenerCleanup ??= () =>
      this.flushPendingListenerCleanup();
  }

  cleanup(hydratedBlocks: string[]) {
    const deferListenerCleanup = this.initialReplayState.pending;
    if (deferListenerCleanup) {
      this.deferListenerCleanup(hydratedBlocks);
    } else {
      removeListenersFromBlocks(hydratedBlocks, this.jsActionMap);
    }
    for (let blockId of hydratedBlocks) {
      this.registry.delete(blockId);
      if (!deferListenerCleanup) {
        this.jsActionMap.delete(blockId);
      }
      this.invokeTriggerCleanupFns(blockId);
      this.hydrating.delete(blockId);
      this.awaitingCallbacks.delete(blockId);
    }
    if (!deferListenerCleanup && this.canCleanUpEventContract()) {
      this.contract.instance?.cleanUp();
    }
  }

  private canCleanUpEventContract(): boolean {
    if (this.size > 0 || this.hydrating.size > 0 || this.awaitingCallbacks.size > 0) {
      return false;
    }
    for (const key of this.jsActionMap.keys()) {
      // Empty string is EAGER_CONTENT_LISTENERS_KEY; any other key belongs to a defer block.
      if (key !== '') {
        return false;
      }
    }
    return true;
  }

  private flushPendingListenerCleanup(): void {
    this.initialReplayState.flushPendingListenerCleanup = null;
    const pending = this.initialReplayState.pendingListenerCleanup;
    if (pending.size === 0) {
      return;
    }
    const blockIds = Array.from(pending);
    pending.clear();
    removeListenersFromBlocks(blockIds, this.jsActionMap);
    for (const blockId of blockIds) {
      this.jsActionMap.delete(blockId);
    }
    if (this.canCleanUpEventContract()) {
      this.contract.instance?.cleanUp();
    }
  }

  get size(): number {
    return this.registry.size;
  }

  // we have to leave the lowest block Id in the registry
  // unless that block has no children
  addCleanupFn(blockId: string, fn: Function) {
    let cleanupFunctions: Function[] = [];
    if (this.cleanupFns.has(blockId)) {
      cleanupFunctions = this.cleanupFns.get(blockId)!;
    }
    cleanupFunctions.push(fn);
    this.cleanupFns.set(blockId, cleanupFunctions);
  }

  invokeTriggerCleanupFns(blockId: string) {
    const fns = this.cleanupFns.get(blockId) ?? [];
    for (let fn of fns) {
      fn();
    }
    this.cleanupFns.delete(blockId);
  }

  // Blocks that are being hydrated.
  hydrating = new Map<string, PromiseWithResolvers<void>>();

  // Blocks that are awaiting a defer instruction finish.
  private awaitingCallbacks = new Map<string, Function[]>();

  awaitParentBlock(topmostParentBlock: string, callback: Function) {
    const parentBlockAwaitCallbacks = this.awaitingCallbacks.get(topmostParentBlock) ?? [];
    parentBlockAwaitCallbacks.push(callback);
    this.awaitingCallbacks.set(topmostParentBlock, parentBlockAwaitCallbacks);
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: DehydratedBlockRegistry,
    providedIn: null,
    factory: () => new DehydratedBlockRegistry(),
  });
}
