/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef} from '../../application/application_ref';
import {Injectable} from '../../di/injectable';
import {inject} from '../../di/injector_compatibility';
import {EnvironmentProviders} from '../../di/interface/provider';
import {makeEnvironmentProviders} from '../../di/provider_collection';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {PendingTasks} from '../../pending_tasks';
import {scheduleCallbackWithMicrotask, scheduleCallbackWithRafRace} from '../../util/callback_scheduler';
import {performanceMarkFeature} from '../../util/performance';
import {NgZone, NoopNgZone} from '../../zone/ng_zone';

import {ChangeDetectionScheduler, NotificationType, ZONELESS_ENABLED, ZONELESS_SCHEDULER_DISABLED} from './zoneless_scheduling';

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
            stackFromLastFewNotifications.join('\n'));
  }
}

@Injectable({providedIn: 'root'})
export class ChangeDetectionSchedulerImpl implements ChangeDetectionScheduler {
  private appRef = inject(ApplicationRef);
  private taskService = inject(PendingTasks);
  private pendingRenderTaskId: number|null = null;
  private shouldRefreshViews = false;
  private readonly ngZone = inject(NgZone);
  runningTick = false;
  private cancelScheduledCallback: null|(() => void) = null;
  private readonly zonelessEnabled = inject(ZONELESS_ENABLED);
  private readonly disableScheduling =
      inject(ZONELESS_SCHEDULER_DISABLED, {optional: true}) ?? false;
  private readonly zoneIsDefined = typeof Zone !== 'undefined' && !!Zone.root.run;
  private readonly schedulerTickApplyArgs = [{data: {'__scheduler_tick__': true}}];
  private readonly afterTickSubscription = this.appRef.afterTick.subscribe(() => {
    // If the scheduler isn't running a tick but the application ticked, that means
    // someone called ApplicationRef.tick manually. In this case, we should cancel
    // any change detections that had been scheduled so we don't run an extra one.
    if (!this.runningTick) {
      this.cleanup();
    }
  });
  private useMicrotaskScheduler = false;

  constructor() {
    // TODO(atscott): These conditions will need to change when zoneless is the default
    // Instead, they should flip to checking if ZoneJS scheduling is provided
    this.disableScheduling ||= !this.zonelessEnabled &&
        // NoopNgZone without enabling zoneless means no scheduling whatsoever
        (this.ngZone instanceof NoopNgZone ||
         // The same goes for the lack of Zone without enabling zoneless scheduling
         !this.zoneIsDefined);
  }

  notify(type = NotificationType.RefreshViews): void {
    // When the only source of notification is an afterRender hook will skip straight to the hooks
    // rather than refreshing views in ApplicationRef.tick
    this.shouldRefreshViews ||= type === NotificationType.RefreshViews;

    if (!this.shouldScheduleTick()) {
      return;
    }

    if ((typeof ngDevMode === 'undefined' || ngDevMode)) {
      if (this.useMicrotaskScheduler) {
        trackMicrotaskNotificationForDebugging();
      } else {
        consecutiveMicrotaskNotifications = 0;
        stackFromLastFewNotifications.length = 0;
      }
    }

    const scheduleCallback =
        this.useMicrotaskScheduler ? scheduleCallbackWithMicrotask : scheduleCallbackWithRafRace;
    this.pendingRenderTaskId = this.taskService.add();
    if (this.zoneIsDefined) {
      Zone.root.run(() => {
        this.cancelScheduledCallback = scheduleCallback(() => {
          this.tick(this.shouldRefreshViews);
        }, false /** useNativeTimers */);
      });
    } else {
      this.cancelScheduledCallback = scheduleCallback(() => {
        this.tick(this.shouldRefreshViews);
      }, false /** useNativeTimers */);
    }
  }

  private shouldScheduleTick(): boolean {
    if (this.disableScheduling) {
      return false;
    }
    // already scheduled or running
    if (this.pendingRenderTaskId !== null || this.runningTick || this.appRef._runningTick) {
      return false;
    }
    // If we're inside the zone don't bother with scheduler. Zone will stabilize
    // eventually and run change detection.
    if (this.zoneIsDefined && NgZone.isInAngularZone()) {
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
  private tick(shouldRefreshViews: boolean): void {
    // When ngZone.run below exits, onMicrotaskEmpty may emit if the zone is
    // stable. We want to prevent double ticking so we track whether the tick is
    // already running and skip it if so.
    if (this.runningTick || this.appRef.destroyed) {
      return;
    }

    const task = this.taskService.add();
    try {
      this.ngZone.run(() => {
        this.runningTick = true;
        this.appRef._tick(shouldRefreshViews);
      }, undefined, this.schedulerTickApplyArgs);
    } catch (e: unknown) {
      this.taskService.remove(task);
      throw e;
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
    this.afterTickSubscription.unsubscribe();
    this.cleanup();
  }

  private cleanup() {
    this.shouldRefreshViews = false;
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
 * ```typescript
 * bootstrapApplication(MyApp, {providers: [
 *   provideExperimentalZonelessChangeDetection(),
 * ]});
 * ```
 *
 * This API is experimental. Neither the shape, nor the underlying behavior is stable and can change
 * in patch versions. There are known feature gaps, including the lack of a public zoneless API
 * which prevents the application from serializing too early with SSR.
 *
 * @publicApi
 * @experimental
 * @see {@link bootstrapApplication}
 */
export function provideExperimentalZonelessChangeDetection(): EnvironmentProviders {
  performanceMarkFeature('NgZoneless');
  return makeEnvironmentProviders([
    {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
    {provide: NgZone, useClass: NoopNgZone},
    {provide: ZONELESS_ENABLED, useValue: true},
  ]);
}
