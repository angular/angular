/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵdefineInjectable} from '../di';
import {DeferBlock} from './interfaces';

// TODO(incremental-hydration): refactor this so that it's not used in CSR cases
/**
 * The DeferBlockRegistry is used for incremental hydration purposes. It keeps
 * track of the Defer Blocks that need hydration so we can effectively
 * navigate up to the top dehydrated defer block and fire appropriate cleanup
 * functions post hydration.
 */
export class DeferBlockRegistry {
  private registry = new Map<string, DeferBlock>();
  private cleanupFns = new Map<string, Function[]>();
  add(blockId: string, info: DeferBlock) {
    this.registry.set(blockId, info);
  }
  get(blockId: string): DeferBlock | null {
    return this.registry.get(blockId) ?? null;
  }
  // TODO(incremental-hydration): we need to determine when this should be invoked
  // to prevent leaking memory in SSR cases
  remove(blockId: string) {
    this.registry.delete(blockId);
  }
  get size(): number {
    return this.registry.size;
  }

  addCleanupFn(blockId: string, fn: Function) {
    let cleanupFunctions: Function[] = [];
    if (this.cleanupFns.has(blockId)) {
      cleanupFunctions = this.cleanupFns.get(blockId)!;
    }
    cleanupFunctions.push(fn);
    this.cleanupFns.set(blockId, cleanupFunctions);
  }

  invokeCleanupFns(blockId: string) {
    // TODO(incremental-hydration): determine if we can safely remove entries from
    // the cleanupFns after they've been invoked. Can we reset
    // `this.cleanupFns.get(blockId)`?
    const fns = this.cleanupFns.get(blockId) ?? [];
    for (let fn of fns) {
      fn();
    }
  }

  // Blocks that are being hydrated.
  // TODO(incremental-hydration): cleanup task - we currently retain ids post hydration
  // and need to determine when we can remove them.
  hydrating = new Set();

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: DeferBlockRegistry,
    providedIn: 'root',
    factory: () => new DeferBlockRegistry(),
  });
}
