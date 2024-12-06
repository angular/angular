/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BehaviorSubject} from 'rxjs';

import {inject} from './di/injector_compatibility';
import {ɵɵdefineInjectable} from './di/interface/defs';
import {OnDestroy} from './interface/lifecycle_hooks';
import {
  ChangeDetectionScheduler,
  NotificationSource,
} from './change_detection/scheduling/zoneless_scheduling';

/**
 * Internal implementation of the pending tasks service.
 */
export class PendingTasksInternal implements OnDestroy {
  private taskId = 0;
  private pendingTasks = new Set<number>();
  private get _hasPendingTasks() {
    return this.hasPendingTasks.value;
  }
  hasPendingTasks = new BehaviorSubject<boolean>(false);

  add(): number {
    if (!this._hasPendingTasks) {
      this.hasPendingTasks.next(true);
    }
    const taskId = this.taskId++;
    this.pendingTasks.add(taskId);
    return taskId;
  }

  has(taskId: number): boolean {
    return this.pendingTasks.has(taskId);
  }

  remove(taskId: number): void {
    this.pendingTasks.delete(taskId);
    if (this.pendingTasks.size === 0 && this._hasPendingTasks) {
      this.hasPendingTasks.next(false);
    }
  }

  ngOnDestroy(): void {
    this.pendingTasks.clear();
    if (this._hasPendingTasks) {
      this.hasPendingTasks.next(false);
    }
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: PendingTasksInternal,
    providedIn: 'root',
    factory: () => new PendingTasksInternal(),
  });
}

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
 * @publicApi
 * @developerPreview
 */
export class PendingTasks {
  private internalPendingTasks = inject(PendingTasksInternal);
  private scheduler = inject(ChangeDetectionScheduler);
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
   * Application stability is at least delayed until the next tick after the `run` method resolves
   * so it is safe to make additional updates to application state that would require UI synchronization:
   *
   * ```ts
   * const userData = await pendingTasks.run(() => fetch('/api/user'));
   * this.userData.set(userData);
   * ```
   *
   * @param fn The asynchronous function to execute
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    const removeTask = this.add();
    try {
      return await fn();
    } finally {
      removeTask();
    }
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: PendingTasks,
    providedIn: 'root',
    factory: () => new PendingTasks(),
  });
}
