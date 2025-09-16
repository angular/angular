import {TracingService, TracingSnapshot, TracingAction} from '../../application/tracing';
import {NotificationSource} from '../../change_detection/scheduling/zoneless_scheduling';
import {ChangeDetectionScheduler} from '../../change_detection/scheduling/zoneless_scheduling_impl';
import {inject} from '../../di';
import {ErrorHandler} from '../../error_handler';
import {ɵɵdefineInjectable} from '../../r3_symbols';
import {NgZone} from '../../zone';
import {AFTER_RENDER_SEQUENCES_TO_ADD, FLAGS, LViewFlags} from '../interfaces/view';
import {profiler} from '../profiler';
import {ProfilerEvent} from '../profiler_types';
import {markAncestorsForTraversal} from '../util/view_utils';
import {AfterRenderSequence, AFTER_RENDER_PHASES} from './manager';

export class AfterRenderImpl {
  private readonly ngZone = inject(NgZone);
  private readonly scheduler = inject(ChangeDetectionScheduler);
  private readonly errorHandler = inject(ErrorHandler, {optional: true});

  /** Current set of active sequences. */
  private readonly sequences = new Set<AfterRenderSequence>();

  /** Tracks registrations made during the current set of executions. */
  private readonly deferredRegistrations = new Set<AfterRenderSequence>();

  /** Whether the `AfterRenderManager` is currently executing hooks. */
  executing = false;

  constructor() {
    // Inject the tracing service to make sure it's initialized.
    inject(TracingService, {optional: true});
  }

  /**
   * Run the sequence of phases of hooks, once through. As a result of executing some hooks, more
   * might be scheduled.
   */
  execute(): void {
    const hasSequencesToExecute = this.sequences.size > 0;

    if (hasSequencesToExecute) {
      profiler(ProfilerEvent.AfterRenderHooksStart);
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
              const hookFn = sequence.hooks[phase]!;
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
      this.scheduler.notify(NotificationSource.RenderHook);
    }
    this.deferredRegistrations.clear();

    if (hasSequencesToExecute) {
      profiler(ProfilerEvent.AfterRenderHooksEnd);
    }
  }

  register(sequence: AfterRenderSequence): void {
    const {view} = sequence;
    if (view !== undefined) {
      // Delay adding it to the manager, add it to the view instead.
      (view[AFTER_RENDER_SEQUENCES_TO_ADD] ??= []).push(sequence);

      // Mark the view for traversal to ensure we eventually schedule the afterNextRender.
      markAncestorsForTraversal(view);
      view[FLAGS] |= LViewFlags.HasChildViewsToRefresh;
    } else if (!this.executing) {
      this.addSequence(sequence);
    } else {
      this.deferredRegistrations.add(sequence);
    }
  }

  addSequence(sequence: AfterRenderSequence): void {
    this.sequences.add(sequence);
    // Trigger an `ApplicationRef.tick()` if one is not already pending/running, because we have a
    // new render hook that needs to run.
    this.scheduler.notify(NotificationSource.RenderHook);
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

  protected maybeTrace<T>(fn: () => T, snapshot: TracingSnapshot | null): T {
    // Only trace the execution if the snapshot is defined.
    return snapshot ? snapshot.run(TracingAction.AFTER_NEXT_RENDER, fn) : fn();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: AfterRenderImpl,
    providedIn: 'root',
    factory: () => new AfterRenderImpl(),
  });
}
