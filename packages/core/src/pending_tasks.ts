/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs';

import {Injectable} from './di/injectable';
import {OnDestroy} from './interface/lifecycle_hooks';

/**
 * Internal implementation of the pending tasks service.
 */
@Injectable({providedIn: 'root'})
export class PendingTasks implements ExperimentalPendingTasks, OnDestroy {
  private taskId = 0;
  private pendingTasks = new Set<ExperimentalPendingTaskHandle>();
  private get _hasPendingTasks() {
    return this.hasPendingTasks.value;
  }
  hasPendingTasks = new BehaviorSubject<boolean>(false);

  add(): ExperimentalPendingTaskHandle {
    if (!this._hasPendingTasks) {
      this.hasPendingTasks.next(true);
    }
    const taskId = this.taskId++ as unknown as ExperimentalPendingTaskHandle;
    this.pendingTasks.add(taskId);
    return taskId;
  }

  remove(taskId: ExperimentalPendingTaskHandle): void {
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
}

/**
 * An opaque handle representing a pending task. Users should not assume anything about the internal
 * type or structure of this handle.
 *
 * @publicApi
 * @experimental
 */
export type ExperimentalPendingTaskHandle = {
  __brand: 'experimentalPendingTask'
};

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
 * const task = pendingTasks.add();
 * // do work that should block application's stability and then:
 * pendingTasks.remove(task);
 * ```
 *
 * This API is experimental. Neither the shape, nor the underlying behavior is stable and can change
 * in patch versions. We will iterate on the exact API based on the feedback and our understanding
 * of the problem and solution space.
 *
 * @publicApi
 * @experimental
 */
@Injectable({
  providedIn: 'root',
  useExisting: PendingTasks,
})
export abstract class ExperimentalPendingTasks {
  /**
   * Adds a new task that should block application's stability.
   * @returns An opaque task handle that can be used to remove a task.
   */
  abstract add(): ExperimentalPendingTaskHandle;

  /**
   * Removes a task given its handle.
   */
  abstract remove(task: ExperimentalPendingTaskHandle): void;
}
