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
import {JSACTION_BLOCK_ELEMENT_MAP} from '../hydration/tokens';
import {DehydratedDeferBlock} from './interfaces';

/**
 * An internal injection token to reference `DehydratedBlockRegistry` implementation
 * in a tree-shakable way.
 */
export const DEHYDRATED_BLOCK_REGISTRY = new InjectionToken<DehydratedBlockRegistry>(
  ngDevMode ? 'DEHYDRATED_BLOCK_REGISTRY' : '',
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

  cleanup(hydratedBlocks: string[]) {
    removeListenersFromBlocks(hydratedBlocks, this.jsActionMap);
    for (let blockId of hydratedBlocks) {
      this.registry.delete(blockId);
      this.jsActionMap.delete(blockId);
      this.invokeTriggerCleanupFns(blockId);
      this.hydrating.delete(blockId);
      this.awaitingCallbacks.delete(blockId);
    }
    if (this.size === 0) {
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
