/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, ɵɵdefineInjectable} from '../di';

import {TDeferBlockDetails} from './interfaces';

/**
 * Registers a cleanup function associated with a prefetching trigger
 * of a given defer block.
 */
export function registerTDetailsCleanup(
    injector: Injector, tDetails: TDeferBlockDetails, key: string, cleanupFn: VoidFunction) {
  injector.get(DeferBlockCleanupManager).add(tDetails, key, cleanupFn);
}
/**
 * Invokes all registered prefetch cleanup triggers
 * and removes all cleanup functions afterwards.
 */
export function invokeTDetailsCleanup(injector: Injector, tDetails: TDeferBlockDetails) {
  injector.get(DeferBlockCleanupManager).cleanup(tDetails);
}
/**
 * Internal service to keep track of cleanup functions associated
 * with defer blocks. This class is used to manage cleanup functions
 * created for prefetching triggers.
 */
export class DeferBlockCleanupManager {
  private blocks = new Map<TDeferBlockDetails, Map<string, VoidFunction[]>>();

  add(tDetails: TDeferBlockDetails, key: string, callback: VoidFunction) {
    if (!this.blocks.has(tDetails)) {
      this.blocks.set(tDetails, new Map());
    }
    const block = this.blocks.get(tDetails)!;
    if (!block.has(key)) {
      block.set(key, []);
    }
    const callbacks = block.get(key)!;
    callbacks.push(callback);
  }

  has(tDetails: TDeferBlockDetails, key: string): boolean {
    return !!this.blocks.get(tDetails)?.has(key);
  }

  cleanup(tDetails: TDeferBlockDetails) {
    const block = this.blocks.get(tDetails);
    if (block) {
      for (const callbacks of Object.values(block)) {
        for (const callback of callbacks) {
          callback();
        }
      }
      this.blocks.delete(tDetails);
    }
  }

  ngOnDestroy() {
    for (const [block] of this.blocks) {
      this.cleanup(block);
    }
    this.blocks.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: DeferBlockCleanupManager,
    providedIn: 'root',
    factory: () => new DeferBlockCleanupManager(),
  });
}
