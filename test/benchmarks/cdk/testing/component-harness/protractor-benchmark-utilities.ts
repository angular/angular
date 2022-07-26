/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';
import {USE_BENCHPRESS} from './constants';

/**
 * Records the performance of the given function.
 *
 * @param id A unique identifier.
 * @param callback A function whose performance will be recorded.
 */
export async function benchmark(id: string, callback: () => Promise<unknown>) {
  if (USE_BENCHPRESS) {
    await benchmarkWithBenchpress(id, callback);
  } else {
    await benchmarkWithConsoleAPI(id, callback);
  }
}

/**
 * A simple wrapper for runBenchmark which is a wrapper for benchpress.
 */
async function benchmarkWithBenchpress(id: string, callback: () => Promise<unknown>) {
  await runBenchmark({
    id,
    url: '',
    ignoreBrowserSynchronization: true,
    work: async () => await callback(),
  });
}

/**
 * Measures the time it takes to invoke the given function and prints the duration to the console.
 */
async function benchmarkWithConsoleAPI(id: string, callback: () => Promise<unknown>, runs = 5) {
  const t0 = Number(process.hrtime.bigint()) / 1000000;
  for (let i = 0; i < runs; i++) {
    await callback();
  }
  const t1 = Number(process.hrtime.bigint()) / 1000000;
  console.warn(`${id}: ${((t1 - t0) / runs).toFixed(2)}ms (avg over ${runs} runs)`);
}
