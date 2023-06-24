/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext} from '../../di/contextual';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {DestroyRef} from '../../linker/destroy_ref';
import {Watch} from '../../signals';

/**
 * An effect can, optionally, register a cleanup function. If registered, the cleanup is executed
 * before the next effect run. The cleanup function makes it possible to "cancel" any work that the
 * previous effect run might have started.
 *
 * @developerPreview
 */
export type EffectCleanupFn = () => void;

/**
 * A callback passed to the effect function that makes it possible to register cleanup logic.
 */
export type EffectCleanupRegisterFn = (cleanupFn: EffectCleanupFn) => void;

/**
 * Tracks all effects registered within a given application and runs them via `flush`.
 */
export class EffectManager {
  private all = new Set<Watch>();
  private queue = new Map<Watch, Zone|null>();

  create(
      effectFn: (onCleanup: (cleanupFn: EffectCleanupFn) => void) => void,
      destroyRef: DestroyRef|null, allowSignalWrites: boolean): EffectRef {
    const zone = (typeof Zone === 'undefined') ? null : Zone.current;
    const watch = new Watch(effectFn, (watch) => {
      if (!this.all.has(watch)) {
        return;
      }

      this.queue.set(watch, zone);
    }, allowSignalWrites);

    this.all.add(watch);

    // Effects start dirty.
    watch.notify();

    let unregisterOnDestroy: (() => void)|undefined;

    const destroy = () => {
      watch.cleanup();
      unregisterOnDestroy?.();
      this.all.delete(watch);
      this.queue.delete(watch);
    };

    unregisterOnDestroy = destroyRef?.onDestroy(destroy);

    return {
      destroy,
    };
  }

  flush(): void {
    if (this.queue.size === 0) {
      return;
    }

    for (const [watch, zone] of this.queue) {
      this.queue.delete(watch);
      if (zone) {
        zone.run(() => watch.run());
      } else {
        watch.run();
      }
    }
  }

  get isQueueEmpty(): boolean {
    return this.queue.size === 0;
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: EffectManager,
    providedIn: 'root',
    factory: () => new EffectManager(),
  });
}

/**
 * A global reactive effect, which can be manually destroyed.
 *
 * @developerPreview
 */
export interface EffectRef {
  /**
   * Shut down the effect, removing it from any upcoming scheduled executions.
   */
  destroy(): void;
}

/**
 * Options passed to the `effect` function.
 *
 * @developerPreview
 */
export interface CreateEffectOptions {
  /**
   * The `Injector` in which to create the effect.
   *
   * If this is not provided, the current injection context will be used instead (via `inject`).
   */
  injector?: Injector;

  /**
   * Whether the `effect` should require manual cleanup.
   *
   * If this is `false` (the default) the effect will automatically register itself to be cleaned up
   * with the current `DestroyRef`.
   */
  manualCleanup?: boolean;

  /**
   * Whether the `effect` should allow writing to signals.
   *
   * Using effects to synchronize data by writing to signals can lead to confusing and potentially
   * incorrect behavior, and should be enabled only when necessary.
   */
  allowSignalWrites?: boolean;
}

/**
 * Create a global `Effect` for the given reactive function.
 *
 * @developerPreview
 */
export function effect(
    effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
    options?: CreateEffectOptions): EffectRef {
  !options?.injector && assertInInjectionContext(effect);
  const injector = options?.injector ?? inject(Injector);
  const effectManager = injector.get(EffectManager);
  const destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;
  return effectManager.create(effectFn, destroyRef, !!options?.allowSignalWrites);
}
