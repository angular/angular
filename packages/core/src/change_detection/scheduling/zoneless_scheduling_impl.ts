/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Subscription} from 'rxjs';

import {ApplicationRef, ApplicationRefDirtyFlags} from '../../application/application_ref';
import {Injectable} from '../../di/injectable';
import {inject} from '../../di/injector_compatibility';
import {EnvironmentProviders} from '../../di/interface/provider';
import {makeEnvironmentProviders} from '../../di/provider_collection';
import {RuntimeError, RuntimeErrorCode, formatRuntimeError} from '../../errors';
import {PendingTasksInternal} from '../../pending_tasks';
import {
  scheduleCallbackWithMicrotask,
  scheduleCallbackWithRafRace,
} from '../../util/callback_scheduler';
import {performanceMarkFeature} from '../../util/performance';
import {NgZone, NgZonePrivate, NoopNgZone, angularZoneInstanceIdProperty} from '../../zone/ng_zone';

import {
  ChangeDetectionScheduler,
  NotificationSource,
  PROVIDED_ZONELESS,
  SCHEDULE_IN_ROOT_ZONE,
  ZONELESS_ENABLED,
  ZONELESS_SCHEDULER_DISABLED,
} from './zoneless_scheduling';
import {TracingService} from '../../application/tracing';
import {INTERNAL_APPLICATION_ERROR_HANDLER} from '../../error_handler';

const CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT = 100;
let consecutiveMicrotaskNotifications = 0;
let stackFromLastFewNotifications: string[] = [];

function trackMicrotaskNotificationForDebugging() {
  consecutiveMicrotaskNotifications++;
  if (CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT - consecutiveMicrotaskNotifications < 5) {
    const stack = new Error().stack;
    if (stack) {
      stackFromLastFewNotifications.push(stack);
    }
  }

  if (consecutiveMicrotaskNotifications === CONSECUTIVE_MICROTASK_NOTIFICATION_LIMIT) {
    throw new RuntimeError(
      RuntimeErrorCode.INFINITE_CHANGE_DETECTION,
      'Angular could not stabilize because there were endless change notifications within the browser event loop. ' +
        'The stack from the last several notifications: \n' +
        stackFromLastFewNotifications.join('\n'),
    );
  }
}

@Injectable({providedIn: 'root'})
export class ChangeDetectionSchedulerImpl implements ChangeDetectionScheduler {
  private readonly applicationErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
  private readonly appRef = inject(ApplicationRef);
  private readonly taskService = inject(PendingTasksInternal);
  private readonly ngZone = inject(NgZone);
  private readonly zonelessEnabled = inject(ZONELESS_ENABLED);
  private readonly tracing = inject(TracingService, {optional: true});
  private readonly disableScheduling =
    inject(ZONELESS_SCHEDULER_DISABLED, {optional: true}) ?? false;
  private readonly zoneIsDefined = typeof Zone !== 'undefined' && !!Zone.root.run;
  private readonly schedulerTickApplyArgs = [{data: {'__scheduler_tick__': true}}];
  private readonly subscriptions = new Subscription();
  private readonly angularZoneId = this.zoneIsDefined
    ? (this.ngZone as NgZonePrivate)._inner?.get(angularZoneInstanceIdProperty)
    : null;
  private readonly scheduleInRootZone =
    !this.zonelessEnabled &&
    this.zoneIsDefined &&
    (inject(SCHEDULE_IN_ROOT_ZONE, {optional: true}) ?? false);

  private cancelScheduledCallback: null | (() => void) = null;
  private useMicrotaskScheduler = false;
  runningTick = false;
  pendingRenderTaskId: number | null = null;

  constructor() {
    this.subscriptions.add(
      this.appRef.afterTick.subscribe(() => {
        // If the scheduler isn't running a tick but the application ticked, that means
        // someone called ApplicationRef.tick manually. In this case, we should cancel
        // any change detections that had been scheduled so we don't run an extra one.
        if (!this.runningTick) {
          this.cleanup();
        }
      }),
    );
    this.subscriptions.add(
      this.ngZone.onUnstable.subscribe(() => {
        // If the zone becomes unstable when we're not running tick (this happens from the zone.run),
        // we should cancel any scheduled change detection here because at this point we
        // know that the zone will stabilize at some point and run change detection itself.
        if (!this.runningTick) {
          this.cleanup();
        }
      }),
    );

    // TODO(atscott): These conditions will need to change when zoneless is the default
    // Instead, they should flip to checking if ZoneJS scheduling is provided
    this.disableScheduling ||=
      !this.zonelessEnabled &&
      // NoopNgZone without enabling zoneless means no scheduling whatsoever
      (this.ngZone instanceof NoopNgZone ||
        // The same goes for the lack of Zone without enabling zoneless scheduling
        !this.zoneIsDefined);
  }

  notify(source: NotificationSource): void {
    if (!this.zonelessEnabled && source === NotificationSource.Listener) {
      // When the notification comes from a listener, we skip the notification unless the
      // application has enabled zoneless. Ideally, listeners wouldn't notify the scheduler at all
      // automatically. We do not know that a developer made a change in the listener callback that
      // requires an `ApplicationRef.tick` (synchronize templates / run render hooks). We do this
      // only for an easier migration from OnPush components to zoneless. Because listeners are
      // usually executed inside the Angular zone and listeners automatically call `markViewDirty`,
      // developers never needed to manually use `ChangeDetectorRef.markForCheck` or some other API
      // to make listener callbacks work correctly with `OnPush` components.
      return;
    }

    let force = false;

    switch (source) {
      case NotificationSource.MarkAncestorsForTraversal: {
        this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeTraversal;
        break;
      }
      case NotificationSource.DebugApplyChanges:
      case NotificationSource.DeferBlockStateUpdate:
      case NotificationSource.MarkForCheck:
      case NotificationSource.Listener:
      case NotificationSource.SetInput: {
        this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeCheck;
        break;
      }
      case NotificationSource.CustomElement: {
        // We use `ViewTreeTraversal` to ensure we refresh the element even if this is triggered
        // during CD. In practice this is a no-op since the elements code also calls via a
        // `markForRefresh()` API which sends `NotificationSource.MarkAncestorsForTraversal` anyway.
        this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeTraversal;
        force = true;
        break;
      }
      case NotificationSource.RootEffect: {
        this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.RootEffects;
        // Root effects still force a CD, even if the scheduler is disabled. This ensures that
        // effects always run, even when triggered from outside the zone when the scheduler is
        // otherwise disabled.
        force = true;
        break;
      }
      case NotificationSource.ViewEffect: {
        // This is technically a no-op, since view effects will also send a
        // `MarkAncestorsForTraversal` notification. Still, we set this for logical consistency.
        this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeTraversal;
        // View effects still force a CD, even if the scheduler is disabled. This ensures that
        // effects always run, even when triggered from outside the zone when the scheduler is
        // otherwise disabled.
        force = true;
        break;
      }
      case NotificationSource.PendingTaskRemoved: {
        // Removing a pending task via the public API forces a scheduled tick, ensuring that
        // stability is async and delayed until there was at least an opportunity to run
        // application synchronization. This prevents some footguns when working with the
        // public API for pending tasks where developers attempt to update application state
        // immediately after removing the last task.
        force = true;
        break;
      }
      case NotificationSource.ViewDetachedFromDOM:
      case NotificationSource.ViewAttached:
      case NotificationSource.RenderHook:
      case NotificationSource.AsyncAnimationsLoaded:
      default: {
        // These notifications only schedule a tick but do not change whether we should refresh
        // views. Instead, we only need to run render hooks unless another notification from the
        // other set is also received before `tick` happens.
        this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.AfterRender;
      }
    }

    // If not already defined, attempt to capture a tracing snapshot of this
    // notification so that the resulting CD run can be attributed to the
    // context which produced the notification.
    this.appRef.tracingSnapshot = this.tracing?.snapshot(this.appRef.tracingSnapshot) ?? null;

    if (!this.shouldScheduleTick(force)) {
      return;
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (this.useMicrotaskScheduler) {
        trackMicrotaskNotificationForDebugging();
      } else {
        consecutiveMicrotaskNotifications = 0;
        stackFromLastFewNotifications.length = 0;
      }
    }

    const scheduleCallback = this.useMicrotaskScheduler
      ? scheduleCallbackWithMicrotask
      : scheduleCallbackWithRafRace;
    this.pendingRenderTaskId = this.taskService.add();
    if (this.scheduleInRootZone) {
      this.cancelScheduledCallback = Zone.root.run(() => scheduleCallback(() => this.tick()));
    } else {
      this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() =>
        scheduleCallback(() => this.tick()),
      );
    }
  }

  private shouldScheduleTick(force: boolean): boolean {
    if ((this.disableScheduling && !force) || this.appRef.destroyed) {
      return false;
    }
    // already scheduled or running
    if (this.pendingRenderTaskId !== null || this.runningTick || this.appRef._runningTick) {
      return false;
    }
    // If we're inside the zone don't bother with scheduler. Zone will stabilize
    // eventually and run change detection.
    if (
      !this.zonelessEnabled &&
      this.zoneIsDefined &&
      Zone.current.get(angularZoneInstanceIdProperty + this.angularZoneId)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Calls ApplicationRef._tick inside the `NgZone`.
   *
   * Calling `tick` directly runs change detection and cancels any change detection that had been
   * scheduled previously.
   *
   * @param shouldRefreshViews Passed directly to `ApplicationRef._tick` and skips straight to
   *     render hooks when `false`.
   */
  private tick(): void {
    // When ngZone.run below exits, onMicrotaskEmpty may emit if the zone is
    // stable. We want to prevent double ticking so we track whether the tick is
    // already running and skip it if so.
    if (this.runningTick || this.appRef.destroyed) {
      return;
    }

    // If we reach the tick and there is no work to be done in ApplicationRef.tick,
    // skip it altogether and clean up. There may be no work if, for example, the only
    // event that notified the scheduler was the removal of a pending task.
    if (this.appRef.dirtyFlags === ApplicationRefDirtyFlags.None) {
      this.cleanup();
      return;
    }

    // The scheduler used to pass "whether to check views" as a boolean flag instead of setting
    // fine-grained dirtiness flags, and global checking was always used on the first pass. This
    // created an interesting edge case: if a notification made a view dirty and then ticked via the
    // scheduler (and not the zone) a global check was still performed.
    //
    // Ideally, this would not be the case, and only zone-based ticks would do global passes.
    // However this is a breaking change and requires fixes in g3. Until this cleanup can be done,
    // we add the `ViewTreeGlobal` flag to request a global check if any views are dirty in a
    // scheduled tick (unless zoneless is enabled, in which case global checks aren't really a
    // thing).
    //
    // TODO(alxhub): clean up and remove this workaround as a breaking change.
    if (!this.zonelessEnabled && this.appRef.dirtyFlags & ApplicationRefDirtyFlags.ViewTreeAny) {
      this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeGlobal;
    }

    const task = this.taskService.add();
    try {
      this.ngZone.run(
        () => {
          this.runningTick = true;
          this.appRef._tick();
        },
        undefined,
        this.schedulerTickApplyArgs,
      );
    } catch (e: unknown) {
      this.taskService.remove(task);
      this.applicationErrorHandler(e);
    } finally {
      this.cleanup();
    }
    // If we're notified of a change within 1 microtask of running change
    // detection, run another round in the same event loop. This allows code
    // which uses Promise.resolve (see NgModel) to avoid
    // ExpressionChanged...Error to still be reflected in a single browser
    // paint, even if that spans multiple rounds of change detection.
    this.useMicrotaskScheduler = true;
    scheduleCallbackWithMicrotask(() => {
      this.useMicrotaskScheduler = false;
      this.taskService.remove(task);
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.cleanup();
  }

  private cleanup() {
    this.runningTick = false;
    this.cancelScheduledCallback?.();
    this.cancelScheduledCallback = null;
    // If this is the last task, the service will synchronously emit a stable
    // notification. If there is a subscriber that then acts in a way that
    // tries to notify the scheduler again, we need to be able to respond to
    // schedule a new change detection. Therefore, we should clear the task ID
    // before removing it from the pending tasks (or the tasks service should
    // not synchronously emit stable, similar to how Zone stableness only
    // happens if it's still stable after a microtask).
    if (this.pendingRenderTaskId !== null) {
      const taskId = this.pendingRenderTaskId;
      this.pendingRenderTaskId = null;
      this.taskService.remove(taskId);
    }
  }
}

/**
 * Provides change detection without ZoneJS for the application bootstrapped using
 * `bootstrapApplication`.
 *
 * This function allows you to configure the application to not use the state/state changes of
 * ZoneJS to schedule change detection in the application. This will work when ZoneJS is not present
 * on the page at all or if it exists because something else is using it (either another Angular
 * application which uses ZoneJS for scheduling or some other library that relies on ZoneJS).
 *
 * This can also be added to the `TestBed` providers to configure the test environment to more
 * closely match production behavior. This will help give higher confidence that components are
 * compatible with zoneless change detection.
 *
 * ZoneJS uses browser events to trigger change detection. When using this provider, Angular will
 * instead use Angular APIs to schedule change detection. These APIs include:
 *
 * - `ChangeDetectorRef.markForCheck`
 * - `ComponentRef.setInput`
 * - updating a signal that is read in a template
 * - when bound host or template listeners are triggered
 * - attaching a view that was marked dirty by one of the above
 * - removing a view
 * - registering a render hook (templates are only refreshed if render hooks do one of the above)
 *
 * @usageNotes
 * ```ts
 * bootstrapApplication(MyApp, {providers: [
 *   provideZonelessChangeDetection(),
 * ]});
 * ```
 *
 * This API is experimental. Neither the shape, nor the underlying behavior is stable and can change
 * in patch versions. There are known feature gaps and API ergonomic considerations. We will iterate
 * on the exact API based on the feedback and our understanding of the problem and solution space.
 *
 * @developerPreview 20.0
 * @see {@link /api/platform-browser/bootstrapApplication bootstrapApplication}
 */
export function provideZonelessChangeDetection(): EnvironmentProviders {
  performanceMarkFeature('NgZoneless');

  if ((typeof ngDevMode === 'undefined' || ngDevMode) && typeof Zone !== 'undefined' && Zone) {
    const message = formatRuntimeError(
      RuntimeErrorCode.UNEXPECTED_ZONEJS_PRESENT_IN_ZONELESS_MODE,
      `The application is using zoneless change detection, but is still loading Zone.js. ` +
        `Consider removing Zone.js to get the full benefits of zoneless. ` +
        `In applications using the Angular CLI, Zone.js is typically included in the "polyfills" section of the angular.json file.`,
    );
    console.warn(message);
  }

  return makeEnvironmentProviders([
    {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
    {provide: NgZone, useClass: NoopNgZone},
    {provide: ZONELESS_ENABLED, useValue: true},
    {provide: SCHEDULE_IN_ROOT_ZONE, useValue: false},
    typeof ngDevMode === 'undefined' || ngDevMode
      ? [{provide: PROVIDED_ZONELESS, useValue: true}]
      : [],
  ]);
}
