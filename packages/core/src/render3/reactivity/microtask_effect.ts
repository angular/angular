/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createWatch, Watch, WatchCleanupRegisterFn} from '@angular/core/primitives/signals';

import {ChangeDetectorRef} from '../../change_detection/change_detector_ref';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {ErrorHandler} from '../../error_handler';
import type {ViewRef} from '../view_ref';
import {DestroyRef} from '../../linker/destroy_ref';
import {FLAGS, LViewFlags, EFFECTS_TO_SCHEDULE} from '../interfaces/view';

import type {CreateEffectOptions, EffectCleanupRegisterFn, EffectRef} from './effect';
import {type SchedulableEffect, ZoneAwareEffectScheduler} from './root_effect_scheduler';
import {performanceMarkFeature} from '../../util/performance';
import {assertNotInReactiveContext} from './asserts';
import {assertInInjectionContext} from '../../di';
import {PendingTasksInternal} from '../../pending_tasks';

export class MicrotaskEffectScheduler extends ZoneAwareEffectScheduler {
  private readonly pendingTasks = inject(PendingTasksInternal);
  private taskId: number | null = null;

  override schedule(effect: SchedulableEffect): void {
    // Check whether there are any pending effects _before_ queueing in the base class.
    super.schedule(effect);
    if (this.taskId === null) {
      this.taskId = this.pendingTasks.add();
      queueMicrotask(() => this.flush());
    }
  }

  override flush(): void {
    try {
      super.flush();
    } finally {
      if (this.taskId !== null) {
        this.pendingTasks.remove(this.taskId);
        this.taskId = null;
      }
    }
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: MicrotaskEffectScheduler,
    providedIn: 'root',
    factory: () => new MicrotaskEffectScheduler(),
  });
}

/**
 * Core reactive node for an Angular effect.
 *
 * `EffectHandle` combines the reactive graph's `Watch` base node for effects with the framework's
 * scheduling abstraction (`MicrotaskEffectScheduler`) as well as automatic cleanup via `DestroyRef`
 * if available/requested.
 */
class EffectHandle implements EffectRef, SchedulableEffect {
  unregisterOnDestroy: (() => void) | undefined;
  readonly watcher: Watch;

  constructor(
    private scheduler: MicrotaskEffectScheduler,
    private effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
    public zone: Zone | null,
    destroyRef: DestroyRef | null,
    private injector: Injector,
    allowSignalWrites: boolean,
  ) {
    this.watcher = createWatch(
      (onCleanup) => this.runEffect(onCleanup),
      () => this.schedule(),
      allowSignalWrites,
    );
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
    this.scheduler.schedule(this);
  }

  destroy(): void {
    this.watcher.destroy();
    this.unregisterOnDestroy?.();

    // Note: if the effect is currently scheduled, it's not un-scheduled, and so the scheduler will
    // retain a reference to it. Attempting to execute it will be a no-op.
  }
}

// Just used for the name for the debug error below.
function effect() {}

/**
 * Create a global `Effect` for the given reactive function.
 */
export function microtaskEffect(
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
    injector.get(MicrotaskEffectScheduler),
    effectFn,
    typeof Zone === 'undefined' ? null : Zone.current,
    destroyRef,
    injector,
    options?.allowSignalWrites ?? false,
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

  return handle;
}
