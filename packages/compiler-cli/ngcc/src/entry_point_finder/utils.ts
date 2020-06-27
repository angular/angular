/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Run a task and track how long it takes.
 *
 * @param task The task whose duration we are tracking.
 * @param log The function to call with the duration of the task.
 * @returns The result of calling `task`.
 */
export function trackDuration<T = void>(task: () => T extends Promise<unknown>? never : T,
                                                              log: (duration: number) => void): T {
  const startTime = Date.now();
  const result = task();
  const duration = Math.round((Date.now() - startTime) / 100) / 10;
  log(duration);
  return result;
}
