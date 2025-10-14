/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TracingAction, TracingService} from '../../application/tracing';
import {ChangeDetectionScheduler} from '../../change_detection/scheduling/zoneless_scheduling';
import {inject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {ErrorHandler} from '../../error_handler';
import {NgZone} from '../../zone';
import {AFTER_RENDER_SEQUENCES_TO_ADD, FLAGS} from '../interfaces/view';
import {profiler} from '../profiler';
import {markAncestorsForTraversal} from '../util/view_utils';
export class AfterRenderManager {
  constructor() {
    this.impl = null;
  }
  execute() {
    this.impl?.execute();
  }
}
/** @nocollapse */
AfterRenderManager.ɵprov = ɵɵdefineInjectable({
  token: AfterRenderManager,
  providedIn: 'root',
  factory: () => new AfterRenderManager(),
});
export const AFTER_RENDER_PHASES = /* @__PURE__ **/ (() => [
  0 /* AfterRenderPhase.EarlyRead */, 1 /* AfterRenderPhase.Write */,
  2 /* AfterRenderPhase.MixedReadWrite */, 3 /* AfterRenderPhase.Read */,
])();
export class AfterRenderImpl {
  constructor() {
    this.ngZone = inject(NgZone);
    this.scheduler = inject(ChangeDetectionScheduler);
    this.errorHandler = inject(ErrorHandler, {optional: true});
    /** Current set of active sequences. */
    this.sequences = new Set();
    /** Tracks registrations made during the current set of executions. */
    this.deferredRegistrations = new Set();
    /** Whether the `AfterRenderManager` is currently executing hooks. */
    this.executing = false;
    // Inject the tracing service to make sure it's initialized.
    inject(TracingService, {optional: true});
  }
  /**
   * Run the sequence of phases of hooks, once through. As a result of executing some hooks, more
   * might be scheduled.
   */
  execute() {
    const hasSequencesToExecute = this.sequences.size > 0;
    if (hasSequencesToExecute) {
      profiler(16 /* ProfilerEvent.AfterRenderHooksStart */);
    }
    this.executing = true;
    for (const phase of AFTER_RENDER_PHASES) {
      for (const sequence of this.sequences) {
        if (sequence.erroredOrDestroyed || !sequence.hooks[phase]) {
          continue;
        }
        try {
          sequence.pipelinedValue = this.ngZone.runOutsideAngular(() =>
            this.maybeTrace(() => {
              const hookFn = sequence.hooks[phase];
              const value = hookFn(sequence.pipelinedValue);
              return value;
            }, sequence.snapshot),
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
      this.scheduler.notify(7 /* NotificationSource.RenderHook */);
    }
    this.deferredRegistrations.clear();
    if (hasSequencesToExecute) {
      profiler(17 /* ProfilerEvent.AfterRenderHooksEnd */);
    }
  }
  register(sequence) {
    const {view} = sequence;
    if (view !== undefined) {
      // Delay adding it to the manager, add it to the view instead.
      (view[AFTER_RENDER_SEQUENCES_TO_ADD] ?? (view[AFTER_RENDER_SEQUENCES_TO_ADD] = [])).push(
        sequence,
      );
      // Mark the view for traversal to ensure we eventually schedule the afterNextRender.
      markAncestorsForTraversal(view);
      view[FLAGS] |= 8192 /* LViewFlags.HasChildViewsToRefresh */;
    } else if (!this.executing) {
      this.addSequence(sequence);
    } else {
      this.deferredRegistrations.add(sequence);
    }
  }
  addSequence(sequence) {
    this.sequences.add(sequence);
    // Trigger an `ApplicationRef.tick()` if one is not already pending/running, because we have a
    // new render hook that needs to run.
    this.scheduler.notify(7 /* NotificationSource.RenderHook */);
  }
  unregister(sequence) {
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
  maybeTrace(fn, snapshot) {
    // Only trace the execution if the snapshot is defined.
    return snapshot ? snapshot.run(TracingAction.AFTER_NEXT_RENDER, fn) : fn();
  }
}
/** @nocollapse */
AfterRenderImpl.ɵprov = ɵɵdefineInjectable({
  token: AfterRenderImpl,
  providedIn: 'root',
  factory: () => new AfterRenderImpl(),
});
export class AfterRenderSequence {
  constructor(impl, hooks, view, once, destroyRef, snapshot = null) {
    this.impl = impl;
    this.hooks = hooks;
    this.view = view;
    this.once = once;
    this.snapshot = snapshot;
    /**
     * Whether this sequence errored or was destroyed during this execution, and hooks should no
     * longer run for it.
     */
    this.erroredOrDestroyed = false;
    /**
     * The value returned by the last hook execution (if any), ready to be pipelined into the next
     * one.
     */
    this.pipelinedValue = undefined;
    this.unregisterOnDestroy = destroyRef?.onDestroy(() => this.destroy());
  }
  afterRun() {
    this.erroredOrDestroyed = false;
    this.pipelinedValue = undefined;
    // Clear the tracing snapshot after the initial run. This snapshot only
    // associates the initial run of the hook with the context that created it.
    // Follow-up runs are independent of that initial context and have different
    // triggers.
    this.snapshot?.dispose();
    this.snapshot = null;
  }
  destroy() {
    this.impl.unregister(this);
    this.unregisterOnDestroy?.();
    const scheduled = this.view?.[AFTER_RENDER_SEQUENCES_TO_ADD];
    if (scheduled) {
      this.view[AFTER_RENDER_SEQUENCES_TO_ADD] = scheduled.filter((s) => s !== this);
    }
  }
}
//# sourceMappingURL=manager.js.map
