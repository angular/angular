/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs';

import {Injectable} from './di';
import {OnDestroy} from './interface/lifecycle_hooks';

/**
 * *Internal* service that keeps track of pending tasks happening in the system
 * during the initial rendering. No tasks are tracked after an initial
 * rendering.
 *
 * This information is needed to make sure that the serialization on the server
 * is delayed until all tasks in the queue (such as an initial navigation or a
 * pending HTTP request) are completed.
 */
@Injectable({providedIn: 'root'})
export class InitialRenderPendingTasks implements OnDestroy {
  private taskId = 0;
  private pendingTasks = new Set<number>();
  hasPendingTasks = new BehaviorSubject<boolean>(false);

  add(): number {
    this.hasPendingTasks.next(true);
    const taskId = this.taskId++;
    this.pendingTasks.add(taskId);
    return taskId;
  }

  remove(taskId: number): void {
    this.pendingTasks.delete(taskId);
    if (this.pendingTasks.size === 0) {
      this.hasPendingTasks.next(false);
    }
  }

  ngOnDestroy(): void {
    this.pendingTasks.clear();
    this.hasPendingTasks.next(false);
  }
}
