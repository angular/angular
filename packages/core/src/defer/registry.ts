/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {inject} from '../di';
import {InjectionToken} from '../di/injection_token';
import {ɵɵdefineInjectable} from '../di/interface/defs';
import {JSACTION_BLOCK_ELEMENT_MAP} from '../hydration/tokens';
import {DeferBlock} from './interfaces';

/**
 * An internal injection token to reference `DeferBlockRegistry` implementation
 * in a tree-shakable way.
 */
export const DEFER_BLOCK_REGISTRY = new InjectionToken<DeferBlockRegistry>(
  ngDevMode ? 'DEFER_BLOCK_REGISTRY' : '',
);

/**
 * The DeferBlockRegistry is used for incremental hydration purposes. It keeps
 * track of the Defer Blocks that need hydration so we can effectively
 * navigate up to the top dehydrated defer block and fire appropriate cleanup
 * functions post hydration.
 */
export class DeferBlockRegistry {
  private registry = new Map<string, DeferBlock>();
  private cleanupFns = new Map<string, Function[]>();
  private jsActionMap: Map<string, Set<Element>> = inject(JSACTION_BLOCK_ELEMENT_MAP);
  add(blockId: string, info: DeferBlock) {
    this.registry.set(blockId, info);
  }
  get(blockId: string): DeferBlock | null {
    return this.registry.get(blockId) ?? null;
  }

  has(blockId: string): boolean {
    return this.registry.has(blockId);
  }

  remove(blockId: string) {
    this.registry.delete(blockId);
  }

  cleanup(blockId: string) {
    this.remove(blockId);
    this.jsActionMap.delete(blockId);
    this.invokeCleanupFns(blockId);
  }

  get size(): number {
    return this.registry.size;
  }

  removeBlocks(blocks: Set<string>) {
    for (let blockId of blocks) {
      this.remove(blockId);
    }
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

  invokeCleanupFns(blockId: string) {
    const fns = this.cleanupFns.get(blockId) ?? [];
    for (let fn of fns) {
      fn();
    }
    this.cleanupFns.delete(blockId);
  }

  // Blocks that are being hydrated.
  // TODO(incremental-hydration): cleanup task - we currently retain ids post hydration
  // and need to determine when we can remove them.
  hydrating = new Set<string>();

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: DeferBlockRegistry,
    providedIn: null,
    factory: () => new DeferBlockRegistry(),
  });
}
