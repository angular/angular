/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from './di';
import {inject} from './di/injector_compatibility';
import {OnDestroy} from './interface/lifecycle_hooks';
import {NgZone} from './zone/ng_zone';

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
  private collection = new Set<number>();
  private ngZone = inject(NgZone);

  private resolve!: VoidFunction;
  private promise!: Promise<void>;

  get whenAllTasksComplete(): Promise<void> {
    if (this.collection.size === 0) {
      this.complete();
    }

    return this.promise;
  }

  completed = false;

  constructor() {
    // Run outside of the Angular zone to avoid triggering
    // extra change detection cycles.
    this.ngZone.runOutsideAngular(() => {
      this.promise = new Promise<void>((resolve) => {
        this.resolve = resolve;
      });
    });
  }

  add(): number {
    if (this.completed) {
      // Indicates that the task was added after
      // the task queue completion, so it's a noop.
      return -1;
    }
    const taskId = this.taskId++;
    this.collection.add(taskId);
    return taskId;
  }

  remove(taskId: number) {
    if (this.completed) return;

    this.collection.delete(taskId);
    if (this.collection.size === 0) {
      this.complete();
    }
  }

  ngOnDestroy() {
    this.complete();
    this.collection.clear();
  }

  private complete(): void {
    this.completed = true;
    this.resolve();
  }
}
