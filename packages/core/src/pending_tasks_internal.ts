/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BehaviorSubject, Observable} from 'rxjs';

import {ɵɵdefineInjectable} from './di/interface/defs';
import {OnDestroy} from './interface/lifecycle_hooks';

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
