/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable } from 'rxjs';
import { OnDestroy } from './interface/lifecycle_hooks';
/**
 * Internal implementation of the pending tasks service.
 */
export declare class PendingTasksInternal implements OnDestroy {
    private taskId;
    private pendingTasks;
    private destroyed;
    private pendingTask;
    get hasPendingTasks(): boolean;
    /**
     * In case the service is about to be destroyed, return a self-completing observable.
     * Otherwise, return the observable that emits the current state of pending tasks.
     */
    get hasPendingTasksObservable(): Observable<boolean>;
    add(): number;
    has(taskId: number): boolean;
    remove(taskId: number): void;
    ngOnDestroy(): void;
    /** @nocollapse */
    static ɵprov: unknown;
}
