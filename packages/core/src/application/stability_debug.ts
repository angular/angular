/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di/injection_token';

export const DEBUG_TASK_TRACKER = new InjectionToken<DebugTaskTracker>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'DEBUG_TASK_TRACKER' : '',
);
export interface DebugTaskTracker {
  add(taskId: number): void;
  remove(taskId: number): void;
}
