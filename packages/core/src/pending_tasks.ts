/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BehaviorSubject, Observable} from 'rxjs';

import {inject} from './di/injector_compatibility';
import {ɵɵdefineInjectable} from './di/interface/defs';
import {OnDestroy} from './interface/lifecycle_hooks';
import {
  ChangeDetectionScheduler,
  NotificationSource,
} from './change_detection/scheduling/zoneless_scheduling';
import {INTERNAL_APPLICATION_ERROR_HANDLER} from './error_handler';

/**
 * Internal implementation of the pending tasks service.
 */
export class PendingTasksInternal implements OnDestroy {
  private taskId = 0;
  private pendingTasks = new Set<number>();
  private destroyed = false;

  private pendingTask = new BehaviorSubject<boolean>(false);

  get hasPendingTasks(): boolean {
    // Accessing the value of a closed `BehaviorSubject` throws an error.
    return this.destroyed ? false : this.pendingTask.value;
  }

  /**
   * In case the service is about to be destroyed, return a self-completing observable.
   * Otherwise, return the observable that emits the current state of pending tasks.
   */
  get hasPendingTasksObservable(): Observable<boolean> {
    if (this.destroyed) {
      // Manually creating the observable pulls less symbols from RxJS than `of(false)`.
      return new Observable<boolean>((subscriber) => {
        subscriber.next(false);
        subscriber.complete();
      });
    }

    return this.pendingTask;
  }

  add(): number {
    // Emitting a value to a closed subject throws an error.
    if (!this.hasPendingTasks && !this.destroyed) {
      this.pendingTask.next(true);
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
    if (this.pendingTasks.size === 0 && this.hasPendingTasks) {
      this.pendingTask.next(false);
    }
  }

  ngOnDestroy(): void {
    this.pendingTasks.clear();
    if (this.hasPendingTasks) {
      this.pendingTask.next(false);
    }
    // We call `unsubscribe()` to release observers, as users may forget to
    // unsubscribe manually when subscribing to `isStable`. We do not call
    // `complete()` because it is unsafe; if someone subscribes using the `first`
    // operator and the observable completes before emitting a value,
    // RxJS will throw an error.
    this.destroyed = true;
    this.pendingTask.unsubscribe();
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
