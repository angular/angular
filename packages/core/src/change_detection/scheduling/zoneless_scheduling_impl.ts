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
import {PendingTasks} from '../../pending_tasks';
import {getCallbackScheduler} from '../../util/callback_scheduler';
import {NgZone, NoopNgZone} from '../../zone/ng_zone';

import {ChangeDetectionScheduler, NotificationType, ZONELESS_ENABLED, ZONELESS_SCHEDULER_DISABLED} from './zoneless_scheduling';

@Injectable({providedIn: 'root'})
export class ChangeDetectionSchedulerImpl implements ChangeDetectionScheduler {
  private appRef = inject(ApplicationRef);
  private taskService = inject(PendingTasks);
  private pendingRenderTaskId: number|null = null;
  private shouldRefreshViews = false;
  private readonly schedule = getCallbackScheduler();
  private readonly ngZone = inject(NgZone);
  private runningTick = false;
  private cancelScheduledCallback: null|(() => void) = null;
  private readonly zonelessEnabled = inject(ZONELESS_ENABLED);
  private readonly disableScheduling =
      inject(ZONELESS_SCHEDULER_DISABLED, {optional: true}) ?? false;
  private readonly zoneIsDefined = typeof Zone !== 'undefined';

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

    this.pendingRenderTaskId = this.taskService.add();
    if (Zone?.root?.run) {
      Zone.root.run(() => {
        this.cancelScheduledCallback = this.schedule(() => {
          this.tick(this.shouldRefreshViews);
        });
      });
    } else {
      this.cancelScheduledCallback = this.schedule(() => {
        this.tick(this.shouldRefreshViews);
      });
    }
  }

  private shouldScheduleTick(): boolean {
    if (this.disableScheduling) {
      return false;
    }
    // already scheduled or running
    if (this.pendingRenderTaskId !== null || this.runningTick) {
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
  tick(shouldRefreshViews: boolean): void {
    // When ngZone.run below exits, onMicrotaskEmpty may emit if the zone is
    // stable. We want to prevent double ticking so we track whether the tick is
    // already running and skip it if so.
    if (this.runningTick || this.appRef.destroyed) {
      return;
    }

    try {
      this.ngZone.run(() => {
        this.runningTick = true;
        this.appRef._tick(shouldRefreshViews);
      });
    } finally {
      this.cleanup();
    }
  }

  ngOnDestroy() {
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

export function provideZonelessChangeDetection(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
    {provide: NgZone, useClass: NoopNgZone},
    {provide: ZONELESS_ENABLED, useValue: true},
  ]);
}
