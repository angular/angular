/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const PERFORMANCE_MARK_PREFIX = '🅰️';

let enablePerfLogging = false;

/**
 * Function that will start measuring against the performance API
 * Should be used in pair with stopMeasuring
 */
export function startMeasuring<T>(label: string): void {
  if (!enablePerfLogging) {
    return;
  }

  const {startLabel} = labels(label);
  /* tslint:disable:ban */
  performance.mark(startLabel);
  /* tslint:enable:ban */
}

/**
 * Function that will stop measuring against the performance API
 * Should be used in pair with startMeasuring
 */
export function stopMeasuring(label: string): void {
  if (!enablePerfLogging) {
    return;
  }

  const {startLabel, labelName, endLabel} = labels(label);
  /* tslint:disable:ban */
  performance.mark(endLabel);
  performance.measure(labelName, startLabel, endLabel);
  performance.clearMarks(startLabel);
  performance.clearMarks(endLabel);
  /* tslint:enable:ban */
}

export function labels(label: string) {
  const labelName = `${PERFORMANCE_MARK_PREFIX}:${label}`;
  return {
    labelName,
    startLabel: `start:${labelName}`,
    endLabel: `end:${labelName}`,
  };
}

let warningLogged = false;
/**
 * This enables an internal performance profiler
 *
 * It should not be imported in application code
 */
export function enableProfiling() {
  if (
    !warningLogged &&
    (typeof performance === 'undefined' || !performance.mark || !performance.measure)
  ) {
    warningLogged = true;
    console.warn('Performance API is not supported on this platform');
    return;
  }

  enablePerfLogging = true;
}
export function disableProfiling() {
  enablePerfLogging = false;
}
