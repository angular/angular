/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from './di/injector_compatibility';
import {ɵɵdefineInjectable} from './di/interface/defs';
import {
  ChangeDetectionScheduler,
  NotificationSource,
} from './change_detection/scheduling/zoneless_scheduling';
import {INTERNAL_APPLICATION_ERROR_HANDLER} from './error_handler';
import {PendingTasksInternal} from './pending_tasks_internal';

/**
 * Service that keeps track of pending tasks contributing to the stableness of Angular
 * application. While several existing Angular services (ex.: `HttpClient`) will internally manage
 * tasks influencing stability, this API gives control over stability to library and application
 * developers for specific cases not covered by Angular internals.
 *
 * The concept of stability comes into play in several important scenarios:
 * - SSR process needs to wait for the application stability before serializing and sending rendered
 * HTML;
 * - tests might want to delay assertions until the application becomes stable;
 *
 * @usageNotes
 * ```ts
 * const pendingTasks = inject(PendingTasks);
 * const taskCleanup = pendingTasks.add();
 * // do work that should block application's stability and then:
 * taskCleanup();
 * ```
 *
 * @publicApi 20.0
 */
export class PendingTasks {
  private readonly internalPendingTasks = inject(PendingTasksInternal);
  private readonly scheduler = inject(ChangeDetectionScheduler);
  private readonly errorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
  /**
   * Adds a new task that should block application's stability.
   * @returns A cleanup function that removes a task when called.
   */
  add(): () => void {
    const taskId = this.internalPendingTasks.add();
    return () => {
      if (!this.internalPendingTasks.has(taskId)) {
        // This pending task has already been cleared.
        return;
      }
      // Notifying the scheduler will hold application stability open until the next tick.
      this.scheduler.notify(NotificationSource.PendingTaskRemoved);
      this.internalPendingTasks.remove(taskId);
    };
  }

  /**
   * Runs an asynchronous function and blocks the application's stability until the function completes.
   *
   * ```ts
   * pendingTasks.run(async () => {
   *   const userData = await fetch('/api/user');
   *   this.userData.set(userData);
   * });
   * ```
   *
   * @param fn The asynchronous function to execute
   * @developerPreview 19.0
   */
  run(fn: () => Promise<unknown>): void {
    const removeTask = this.add();
    fn().catch(this.errorHandler).finally(removeTask);
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: PendingTasks,
    providedIn: 'root',
    factory: () => new PendingTasks(),
  });
}
