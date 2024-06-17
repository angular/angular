/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
export class PendingTasks implements OnDestroy {
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
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: PendingTasks,
    providedIn: 'root',
    factory: () => new PendingTasks(),
  });
}

/**
 * Experimental service that keeps track of pending tasks contributing to the stableness of Angular
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
 * ```typescript
 * const pendingTasks = inject(ExperimentalPendingTasks);
 * const taskCleanup = pendingTasks.add();
 * // do work that should block application's stability and then:
 * taskCleanup();
 * ```
 *
 * This API is experimental. Neither the shape, nor the underlying behavior is stable and can change
 * in patch versions. We will iterate on the exact API based on the feedback and our understanding
 * of the problem and solution space.
 *
 * @publicApi
 * @experimental
 */
export class ExperimentalPendingTasks {
  private internalPendingTasks = inject(PendingTasks);
  private scheduler = inject(ChangeDetectionScheduler);
  /**
   * Adds a new task that should block application's stability.
   * @returns A cleanup function that removes a task when called.
   */
  add(): () => void {
    const taskId = this.internalPendingTasks.add();
    return () => {
      // Notifying the scheduler will hold application stability open until the next tick.
      this.scheduler.notify(NotificationSource.PendingTaskRemoved);
      this.internalPendingTasks.remove(taskId);
    };
  }

  /**
   * Runs an asynchronous function and blocks the application's stability until the function completes.
   *
   * ```
   * pendingTasks.run(async () => {
   *   const userData = await fetch('/api/user');
   *   this.userData.set(userData);
   * });
   * ```
   *
   * Application stability is at least delayed until the next tick after the `run` method resolves
   * so it is safe to make additional updates to application state that would require UI synchronization:
   *
   * ```
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
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: ExperimentalPendingTasks,
    providedIn: 'root',
    factory: () => new ExperimentalPendingTasks(),
  });
}
