/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵdefineInjectable} from '../di';
import {TNode} from '../render3/interfaces/node';
import {LView} from '../render3/interfaces/view';

export class DeferBlockRegistry {
  private registry = new Map<string, {lView: LView; tNode: TNode}>();
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
