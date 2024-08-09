/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createWatch, SIGNAL, Watch, WatchCleanupRegisterFn} from '@angular/core/primitives/signals';

import {ChangeDetectorRef} from '../../change_detection';
import {assertInInjectionContext} from '../../di/contextual';
import {InjectionToken} from '../../di/injection_token';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {ErrorHandler} from '../../error_handler';
import type {ViewRef} from '../view_ref';
import {DestroyRef} from '../../linker/destroy_ref';
import {FLAGS, LViewFlags, EFFECTS_TO_SCHEDULE} from '../interfaces/view';

import {assertNotInReactiveContext} from './asserts';
import {performanceMarkFeature} from '../../util/performance';
import {PendingTasks} from '../../pending_tasks';
import {emitEffectCreatedEvent, setInjectorProfilerContext} from '../debug/injector_profiler';

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
 *
 * @developerPreview
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

  /**
   * Run any scheduled effects.
   */
  abstract flush(): void;

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: EffectScheduler,
    providedIn: 'root',
    factory: () => new ZoneAwareEffectScheduler(),
  });
}

/**
 * A wrapper around `ZoneAwareQueueingScheduler` that schedules flushing via the microtask queue
 * when.
 */
export class ZoneAwareEffectScheduler implements EffectScheduler {
  private queuedEffectCount = 0;
  private queues = new Map<Zone | null, Set<SchedulableEffect>>();
  private readonly pendingTasks = inject(PendingTasks);
  private taskId: number | null = null;

  scheduleEffect(handle: SchedulableEffect): void {
    this.enqueue(handle);

    if (this.taskId === null) {
      const taskId = (this.taskId = this.pendingTasks.add());
      queueMicrotask(() => {
        this.flush();
        this.pendingTasks.remove(taskId);
        this.taskId = null;
      });
    }
  }

  private enqueue(handle: SchedulableEffect): void {
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
}

/**
 * Core reactive node for an Angular effect.
 *
 * `EffectHandle` combines the reactive graph's `Watch` base node for effects with the framework's
 * scheduling abstraction (`EffectScheduler`) as well as automatic cleanup via `DestroyRef` if
 * available/requested.
 */
class EffectHandle implements EffectRef, SchedulableEffect {
  unregisterOnDestroy: (() => void) | undefined;
  readonly watcher: Watch;

  constructor(
    private scheduler: EffectScheduler,
    private effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
    public creationZone: Zone | null,
    destroyRef: DestroyRef | null,
    private injector: Injector,
    allowSignalWrites: boolean,
    debugName?: string,
  ) {
    this.watcher = createWatch(
      (onCleanup) => this.runEffect(onCleanup),
      () => this.schedule(),
      allowSignalWrites,
    );

    if (ngDevMode) {
      this.watcher[SIGNAL].debugName = debugName;
    }

    this.unregisterOnDestroy = destroyRef?.onDestroy(() => this.destroy());
  }

  private runEffect(onCleanup: WatchCleanupRegisterFn): void {
    try {
      this.effectFn(onCleanup);
    } catch (err) {
      // Inject the `ErrorHandler` here in order to avoid circular DI error
      // if the effect is used inside of a custom `ErrorHandler`.
      const errorHandler = this.injector.get(ErrorHandler, null, {optional: true});
      errorHandler?.handleError(err);
    }
  }

  run(): void {
    this.watcher.run();
  }

  private schedule(): void {
    this.scheduler.scheduleEffect(this);
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
   * If this is not provided, the current [injection context](guide/di/dependency-injection-context)
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

  /**
   * A debug name for the effect. Used in Angular DevTools to identify the effect.
   */
  debugName?: string;
}

/**
 * Create a global `Effect` for the given reactive function.
 *
 * @developerPreview
 */
export function effect(
  effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateEffectOptions,
): EffectRef {
  performanceMarkFeature('NgSignals');
  ngDevMode &&
    assertNotInReactiveContext(
      effect,
      'Call `effect` outside of a reactive context. For example, schedule the ' +
        'effect inside the component constructor.',
    );

  !options?.injector && assertInInjectionContext(effect);
  const injector = options?.injector ?? inject(Injector);
  const destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;

  const handle = new EffectHandle(
    injector.get(APP_EFFECT_SCHEDULER),
    effectFn,
    typeof Zone === 'undefined' ? null : Zone.current,
    destroyRef,
    injector,
    options?.allowSignalWrites ?? false,
    ngDevMode ? options?.debugName : undefined,
  );

  // Effects need to be marked dirty manually to trigger their initial run. The timing of this
  // marking matters, because the effects may read signals that track component inputs, which are
  // only available after those components have had their first update pass.
  //
  // We inject `ChangeDetectorRef` optionally, to determine whether this effect is being created in
  // the context of a component or not. If it is, then we check whether the component has already
  // run its update pass, and defer the effect's initial scheduling until the update pass if it
  // hasn't already run.
  const cdr = injector.get(ChangeDetectorRef, null, {optional: true}) as ViewRef<unknown> | null;
  if (!cdr || !(cdr._lView[FLAGS] & LViewFlags.FirstLViewPass)) {
    // This effect is either not running in a view injector, or the view has already
    // undergone its first change detection pass, which is necessary for any required inputs to be
    // set.
    handle.watcher.notify();
  } else {
    // Delay the initialization of the effect until the view is fully initialized.
    (cdr._lView[EFFECTS_TO_SCHEDULE] ??= []).push(handle.watcher.notify);
  }

  if (ngDevMode) {
    const prevInjectorProfilerContext = setInjectorProfilerContext({injector, token: null});
    try {
      emitEffectCreatedEvent(handle);
    } finally {
      setInjectorProfilerContext(prevInjectorProfilerContext);
    }
  }

  return handle;
}
