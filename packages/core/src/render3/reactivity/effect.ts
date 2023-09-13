/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext} from '../../di/contextual';
import {InjectionToken} from '../../di/injection_token';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {ErrorHandler} from '../../error_handler';
import {DestroyRef} from '../../linker/destroy_ref';
import {watch, Watch, WatchCleanupRegisterFn} from '../../signals';


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

export interface SchedulableEffect {
  run(): void;
  creationZone: unknown;
}

/**
 * Not public API, which guarantees `EffectScheduler` only ever comes from the application root
 * injector.
 */
export const APP_EFFECT_SCHEDULER = new InjectionToken('', {
  providedIn: 'root',
  factory: () => inject(EffectScheduler),
});

/**
 * A scheduler which manages the execution of effects.
 */
export abstract class EffectScheduler {
  /**
   * Schedule the given effect to be executed at a later time.
   *
   * It is an error to attempt to execute any effects synchronously during a scheduling operation.
   */
  abstract scheduleEffect(e: SchedulableEffect): void;

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: EffectScheduler,
    providedIn: 'root',
    factory: () => new ZoneAwareMicrotaskScheduler(),
  });
}

/**
 * Interface to an `EffectScheduler` capable of running scheduled effects synchronously.
 */
export interface FlushableEffectRunner {
  /**
   * Run any scheduled effects.
   */
  flush(): void;
}

/**
 * An `EffectScheduler` which is capable of queueing scheduled effects per-zone, and flushing them
 * as an explicit operation.
 */
export class ZoneAwareQueueingScheduler implements EffectScheduler, FlushableEffectRunner {
  private queuedEffectCount = 0;
  private queues = new Map<Zone|null, Set<SchedulableEffect>>();

  scheduleEffect(handle: SchedulableEffect): void {
    const zone = handle.creationZone as Zone | null;
    if (!this.queues.has(zone)) {
      this.queues.set(zone, new Set());
    }

    const queue = this.queues.get(zone)!;
    if (queue.has(handle)) {
      return;
    }
    this.queuedEffectCount++;
    queue.add(handle);
  }

  /**
   * Run all scheduled effects.
   *
   * Execution order of effects within the same zone is guaranteed to be FIFO, but there is no
   * ordering guarantee between effects scheduled in different zones.
   */
  flush(): void {
    while (this.queuedEffectCount > 0) {
      for (const [zone, queue] of this.queues) {
        // `zone` here must be defined.
        if (zone === null) {
          this.flushQueue(queue);
        } else {
          zone.run(() => this.flushQueue(queue));
        }
      }
    }
  }

  private flushQueue(queue: Set<SchedulableEffect>): void {
    for (const handle of queue) {
      queue.delete(handle);
      this.queuedEffectCount--;

      // TODO: what happens if this throws an error?
      handle.run();
    }
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: ZoneAwareQueueingScheduler,
    providedIn: 'root',
    factory: () => new ZoneAwareQueueingScheduler(),
  });
}

/**
 * A wrapper around `ZoneAwareQueueingScheduler` that schedules flushing via the microtask queue
 * when.
 */
export class ZoneAwareMicrotaskScheduler implements EffectScheduler {
  private hasQueuedFlush = false;
  private delegate = new ZoneAwareQueueingScheduler();
  private flushTask = () => {
    // Leave `hasQueuedFlush` as `true` so we don't queue another microtask if more effects are
    // scheduled during flushing. The flush of the `ZoneAwareQueueingScheduler` delegate is
    // guaranteed to empty the queue.
    this.delegate.flush();
    this.hasQueuedFlush = false;

    // This is a variable initialization, not a method.
    // tslint:disable-next-line:semicolon
  };

  scheduleEffect(handle: SchedulableEffect): void {
    this.delegate.scheduleEffect(handle);

    if (!this.hasQueuedFlush) {
      queueMicrotask(this.flushTask);
      this.hasQueuedFlush = true;
    }
  }
}

/**
 * Core reactive node for an Angular effect.
 *
 * `EffectHandle` combines the reactive graph's `Watch` base node for effects with the framework's
 * scheduling abstraction (`EffectScheduler`) as well as automatic cleanup via `DestroyRef` if
 * available/requested.
 */
class EffectHandle implements EffectRef, SchedulableEffect {
  unregisterOnDestroy: (() => void)|undefined;
  protected watcher: Watch;

  constructor(
      private scheduler: EffectScheduler,
      private effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
      public creationZone: Zone|null, destroyRef: DestroyRef|null,
      private errorHandler: ErrorHandler|null, allowSignalWrites: boolean) {
    this.watcher =
        watch((onCleanup) => this.runEffect(onCleanup), () => this.schedule(), allowSignalWrites);
    this.unregisterOnDestroy = destroyRef?.onDestroy(() => this.destroy());
  }

  private runEffect(onCleanup: WatchCleanupRegisterFn): void {
    try {
      this.effectFn(onCleanup);
    } catch (err) {
      this.errorHandler?.handleError(err);
    }
  }

  run(): void {
    this.watcher.run();
  }

  private schedule(): void {
    this.scheduler.scheduleEffect(this);
  }

  notify(): void {
    this.watcher.notify();
  }

  destroy(): void {
    this.watcher.destroy();
    this.unregisterOnDestroy?.();

    // Note: if the effect is currently scheduled, it's not un-scheduled, and so the scheduler will
    // retain a reference to it. Attempting to execute it will be a no-op.
  }
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
   * If this is not provided, the current [injection context](guide/dependency-injection-context)
   * will be used instead (via `inject`).
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
  const errorHandler = injector.get(ErrorHandler, null, {optional: true});
  const destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;

  const handle = new EffectHandle(
      injector.get(APP_EFFECT_SCHEDULER), effectFn,
      (typeof Zone === 'undefined') ? null : Zone.current, destroyRef, errorHandler,
      options?.allowSignalWrites ?? false);

  // Effects start dirty.
  handle.notify();

  return handle;
}
