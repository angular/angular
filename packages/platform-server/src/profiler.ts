/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const PERFORMANCE_MARK_PREFIX = '🅰️';

let enablePerfLogging = false;

export function runAndMeasurePerf<T>(label: string, method: () => T): T {
  if (!enablePerfLogging) {
    return method();
  }

  const labelName = `${PERFORMANCE_MARK_PREFIX}:${label}`;
  const startLabel = `start:${labelName}`;
  const endLabel = `end:${labelName}`;

  const end = () => {
    /* tslint:disable:ban */
    performance.mark(endLabel);
    performance.measure(labelName, startLabel, endLabel);
    performance.clearMarks(startLabel);
    performance.clearMarks(endLabel);
    /* tslint:enable:ban */
  };

  /* tslint:disable:ban */
  performance.mark(startLabel);
  /* tslint:enable:ban */

  const returnValue = method();
  if (returnValue instanceof Promise) {
    return returnValue.finally(() => end()) as T;
  } else {
    end();
    return returnValue;
  }
}

let warningLogged = false;
/**
 * This enables an internal performance profiler for SSR apps
 *
 * It should not be imported in application code
 */
export function enableSsrProfiling() {
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
export function disableSsrProfiling() {
  enablePerfLogging = false;
}
