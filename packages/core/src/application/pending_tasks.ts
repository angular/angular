/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject} from '../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../di/interface/defs';
import {PendingTasks} from './pending_tasks_internal';
import {NgZone} from '../zone/ng_zone';

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
  private readonly internalPendingTasks = inject(PendingTasks);
  private readonly ngZone = inject(NgZone);

  /**
   * Adds a new task that should block application's stability.
   * @returns A cleanup function that removes a task after a microtask delay when called.
   */
  add(): () => void {
    const taskId = this.internalPendingTasks.add();
    return () => {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.internalPendingTasks.remove(taskId);
        });
      });
    };
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: ExperimentalPendingTasks,
    providedIn: 'root',
    factory: () => new ExperimentalPendingTasks(),
  });
}
