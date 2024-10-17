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
export class DeferBlockRegistry {
  private registry = new Map<string, DeferBlock>();
  private cleanupFns = new Map<string, Function[]>();
  add(blockId: string, info: any) {
    this.registry.set(blockId, info);
  }
  get(blockId: string) {
    return this.registry.get(blockId) ?? null;
  }
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
    const fns = this.cleanupFns.get(blockId) ?? [];
    for (let fn of fns) {
      fn();
    }
  }

  // Blocks that are being hydrated.
  hydrating = new Set();

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: DeferBlockRegistry,
    providedIn: 'root',
    factory: () => new DeferBlockRegistry(),
  });
}
