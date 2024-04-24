/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs';

import {inject} from './di';
import {Injectable} from './di/injectable';
import {OnDestroy} from './interface/lifecycle_hooks';

/**
 * Internal implementation of the pending tasks service.
 */
@Injectable({
  providedIn: 'root',
})
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
@Injectable({
  providedIn: 'root',
})
export class ExperimentalPendingTasks {
  private internalPendingTasks = inject(PendingTasks);
  /**
   * Adds a new task that should block application's stability.
   * @returns A cleanup function that removes a task when called.
   */
  add(): () => void {
    const taskId = this.internalPendingTasks.add();
    return () => this.internalPendingTasks.remove(taskId);
  }
}
