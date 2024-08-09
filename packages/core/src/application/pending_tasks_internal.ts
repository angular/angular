/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs';

import {inject} from '../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../di/interface/defs';
import {OnDestroy} from '../interface/lifecycle_hooks';

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
