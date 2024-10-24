/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionScheduler,
  NotificationSource,
} from '../../change_detection/scheduling/zoneless_scheduling';
import {inject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {ErrorHandler} from '../../error_handler';
import {type DestroyRef} from '../../linker/destroy_ref';
import {NgZone} from '../../zone';
import {AFTER_RENDER_SEQUENCES_TO_REGISTER, FLAGS, LView, LViewFlags} from '../interfaces/view';
import {markAncestorsForTraversal} from '../util/view_utils';
import {AfterRenderPhase, AfterRenderRef} from './api';

export class AfterRenderManager {
  impl: AfterRenderImpl | null = null;

  execute(): void {
    this.impl?.execute();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: AfterRenderManager,
    providedIn: 'root',
    factory: () => new AfterRenderManager(),
  });
}

export class AfterRenderImpl {
  static readonly PHASES = [
    AfterRenderPhase.EarlyRead,
    AfterRenderPhase.Write,
    AfterRenderPhase.MixedReadWrite,
    AfterRenderPhase.Read,
  ] as const;

  private readonly ngZone = inject(NgZone);
  private readonly scheduler = inject(ChangeDetectionScheduler);
  private readonly errorHandler = inject(ErrorHandler, {optional: true});

  /** Current set of active sequences. */
  private readonly sequences = new Set<AfterRenderSequence>();

  /** Tracks registrations made during the current set of executions. */
  private readonly deferredRegistrations = new Set<AfterRenderSequence>();

  /** Whether the `AfterRenderManager` is currently executing hooks. */
  executing = false;

  /**
   * Run the sequence of phases of hooks, once through. As a result of executing some hooks, more
   * might be scheduled.
   */
  execute(): void {
    this.executing = true;
    for (const phase of AfterRenderImpl.PHASES) {
      for (const sequence of this.sequences) {
        if (sequence.erroredOrDestroyed || !sequence.hooks[phase]) {
          continue;
        }

        try {
          sequence.pipelinedValue = this.ngZone.runOutsideAngular(() =>
            sequence.hooks[phase]!(sequence.pipelinedValue),
          );
        } catch (err) {
          sequence.erroredOrDestroyed = true;
          this.errorHandler?.handleError(err);
        }
      }
    }
    this.executing = false;

    // Cleanup step to reset sequence state and also collect one-shot sequences for removal.
    for (const sequence of this.sequences) {
      sequence.afterRun();
      if (sequence.once) {
        this.sequences.delete(sequence);
        // Destroy the sequence so its on destroy callbacks can be cleaned up
        // immediately, instead of waiting until the injector is destroyed.
        sequence.destroy();
      }
    }

    for (const sequence of this.deferredRegistrations) {
      this.sequences.add(sequence);
    }
    if (this.deferredRegistrations.size > 0) {
      this.scheduler.notify(NotificationSource.DeferredRenderHook);
    }
    this.deferredRegistrations.clear();
  }

  queueRegistration(sequence: AfterRenderSequence): void {
    const {view} = sequence;
    // For sequences that are not associated with a view, we can register them directly. However,
    // for sequences associated with a view, we want to ensure that their view has been rendered at
    // least once before registering them. We accomplish this by addig the sequence to a separate
    // queue on the view and triggering a traversal. When the view is traversed, it will regster the
    // sequence.
    //
    // However, there is an edge case to consider here. We could have a nested `afterNextRender`.
    //
    // ```
    // afterNextRender(() => {
    //    ...
    //    afterNextRender(() => { ... });
    // });
    // ```
    //
    // In this case, the inner `afterNextRender` should be registered directly. Because this method
    // is called during the execution of the outer `afterNextRender`, we know that the view has been
    // rendered. We make a slightly more general assumption here, that if we're already executing,
    // we can just directly register.
    //
    // TODO: Note that the assumption above is not 100% correct. We could have a situation where
    // Component A calls `afterNextRender`, and inside the `afterNextRender` creates Component B
    // under a detached parent. If Component B then also calls `afterNextRender`, we will see that
    // it was queued for registration during execution and directly register it, even though
    // Component B has not been rendered yet.
    if (view !== undefined && !this.executing) {
      // Delay adding it to the manager, add it to the view instead.
      (view[AFTER_RENDER_SEQUENCES_TO_REGISTER] ??= []).push(sequence);

      // Mark the view for traversal to ensure we eventually schedule the afterNextRender.
      markAncestorsForTraversal(view);
      view[FLAGS] |= LViewFlags.HasChildViewsToRefresh;
    } else {
      this.register(sequence);
    }
  }

  register(sequence: AfterRenderSequence): void {
    if (!this.executing) {
      this.sequences.add(sequence);
      // Trigger an `ApplicationRef.tick()` if one is not already pending/running, because we have a
      // new render hook that needs to run.
      this.scheduler.notify(NotificationSource.RenderHook);
    } else {
      this.deferredRegistrations.add(sequence);
    }
  }

  unregister(sequence: AfterRenderSequence): void {
    if (this.executing && this.sequences.has(sequence)) {
      // We can't remove an `AfterRenderSequence` in the middle of iteration.
      // Instead, mark it as destroyed so it doesn't run any more, and mark it as one-shot so it'll
      // be removed at the end of the current execution.
      sequence.erroredOrDestroyed = true;
      sequence.pipelinedValue = undefined;
      sequence.once = true;
    } else {
      // It's safe to directly remove this sequence.
      this.sequences.delete(sequence);
      this.deferredRegistrations.delete(sequence);
    }
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: AfterRenderImpl,
    providedIn: 'root',
    factory: () => new AfterRenderImpl(),
  });
}

export type AfterRenderHook = (value?: unknown) => unknown;
export type AfterRenderHooks = [
  /*      EarlyRead */ AfterRenderHook | undefined,
  /*          Write */ AfterRenderHook | undefined,
  /* MixedReadWrite */ AfterRenderHook | undefined,
  /*           Read */ AfterRenderHook | undefined,
];

export class AfterRenderSequence implements AfterRenderRef {
  /**
   * Whether this sequence errored or was destroyed during this execution, and hooks should no
   * longer run for it.
   */
  erroredOrDestroyed: boolean = false;

  /**
   * The value returned by the last hook execution (if any), ready to be pipelined into the next
   * one.
   */
  pipelinedValue: unknown = undefined;

  private unregisterOnDestroy: (() => void) | undefined;

  constructor(
    readonly impl: AfterRenderImpl,
    readonly hooks: AfterRenderHooks,
    readonly view: LView | undefined,
    public once: boolean,
    destroyRef: DestroyRef | null,
  ) {
    this.unregisterOnDestroy = destroyRef?.onDestroy(() => this.destroy());
  }

  afterRun(): void {
    this.erroredOrDestroyed = false;
    this.pipelinedValue = undefined;
  }

  destroy(): void {
    this.impl.unregister(this);
    this.unregisterOnDestroy?.();
    const scheduled = this.view?.[AFTER_RENDER_SEQUENCES_TO_REGISTER];
    if (scheduled) {
      this.view[AFTER_RENDER_SEQUENCES_TO_REGISTER] = scheduled.filter((s) => s !== this);
    }
  }
}
