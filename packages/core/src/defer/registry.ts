/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵdefineInjectable} from '../di';
import {LContainer} from '../render3/interfaces/container';
import {TNode} from '../render3/interfaces/node';
import {LView} from '../render3/interfaces/view';

export class DeferBlockRegistry {
  private registry = new Map<string, {lView: LView; tNode: TNode; lContainer: LContainer}>();
  private cleanupFns = new Map<string, Function[]>();
  add(id: string, info: any) {
    this.registry.set(id, info);
  }
  get(id: string) {
    return this.registry.get(id) ?? null;
  }
  remove(id: string) {
    this.registry.delete(id);
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
  // TODO: come up with a nicer API
  hydrating = new Set();

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: DeferBlockRegistry,
    providedIn: 'root',
    factory: () => new DeferBlockRegistry(),
  });
}
