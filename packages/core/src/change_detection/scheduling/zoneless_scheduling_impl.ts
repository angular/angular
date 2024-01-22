/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef} from '../../application/application_ref';
import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders} from '../../di';
import {PendingTasks} from '../../pending_tasks';
import {global} from '../../util/global';
import {NgZone, NoopNgZone} from '../../zone/ng_zone';

import {ChangeDetectionScheduler} from './zoneless_scheduling';

@Injectable({providedIn: 'root'})
class ChangeDetectionSchedulerImpl implements ChangeDetectionScheduler {
  private appRef = inject(ApplicationRef);
  private taskService = inject(PendingTasks);
  private pendingRenderTaskId: number|null = null;

  notify(): void {
    if (this.pendingRenderTaskId !== null) return;

    this.pendingRenderTaskId = this.taskService.add();
    this.raceTimeoutAndRequestAnimationFrame();
  }

  /**
   * Run change detection after the first of setTimeout and requestAnimationFrame resolves.
   *
   * - `requestAnimationFrame` ensures that change detection runs ahead of a browser repaint.
   * This ensures that the create and update passes of a change detection always happen
   * in the same frame.
   * - When the browser is resource-starved, `rAF` can execute _before_ a `setTimeout` because
   * rendering is a very high priority process. This means that `setTimeout` cannot guarantee
   * same-frame create and update pass, when `setTimeout` is used to schedule the update phase.
   * - While `rAF` gives us the desirable same-frame updates, it has two limitations that
   * prevent it from being used alone. First, it does not run in background tabs, which would
   * prevent Angular from initializing an application when opened in a new tab (for example).
   * Second, repeated calls to requestAnimationFrame will execute at the refresh rate of the
   * hardware (~16ms for a 60Hz display). This would cause significant slowdown of tests that
   * are written with several updates and asserts in the form of "update; await stable; assert;".
   * - Both `setTimeout` and `rAF` are able to "coalesce" several events from a single user
   * interaction into a single change detection. Importantly, this reduces view tree traversals when
   * compared to an alternative timing mechanism like `queueMicrotask`, where change detection would
   * then be interleaves between each event.
   *
   * By running change detection after the first of `setTimeout` and `rAF` to execute, we get the
   * best of both worlds.
   */
  private async raceTimeoutAndRequestAnimationFrame() {
    const timeout = new Promise<void>(resolve => setTimeout(resolve));
    const rAF = typeof global['requestAnimationFrame'] === 'function' ?
        new Promise<void>(resolve => requestAnimationFrame(() => resolve())) :
        null;
    await Promise.race([timeout, rAF]);

    this.tick();
  }

  private tick() {
    try {
      if (!this.appRef.destroyed) {
        this.appRef.tick();
      }
    } finally {
      // If this is the last task, the service will synchronously emit a stable notification. If
      // there is a subscriber that then acts in a way that tries to notify the scheduler again,
      // we need to be able to respond to schedule a new change detection. Therefore, we should
      // clear the task ID before removing it from the pending tasks (or the tasks service should
      // not synchronously emit stable, similar to how Zone stableness only happens if it's still
      // stable after a microtask).
      const taskId = this.pendingRenderTaskId!;
      this.pendingRenderTaskId = null;
      this.taskService.remove(taskId);
    }
  }
}

export function provideZonelessChangeDetection(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
    {provide: NgZone, useClass: NoopNgZone},
  ]);
}
