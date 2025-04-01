/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/* tslint:disable:no-console  */
import {ɵPERFORMANCE_MARK_PREFIX as PERFORMANCE_MARK_PREFIX} from '@angular/core';
import {render} from './src/main.server';
import {initData} from './test-data';

// Defined in the CLI config with "define"
declare const DISABLE_DOM_EMULATION: boolean;

// If you add an new measure, make sure to add it to this map
const levels = new Map<string, number>([
  ['renderApplication', 0],
  ['createServerPlatform', 1],
  ['bootstrap', 1],
  ['_render', 1],
  ['whenStable', 2],
  ['prepareForHydration', 2],
  ['insertEventRecordScript', 2],
  ['serializeTransferStateFactory', 2],
  ['renderToString', 2],
]);

const narrowRun = typeof process !== 'undefined' && process.argv.length > 0;

main(narrowRun);

async function main(narrowRun: boolean) {
  console.log('Benchmarking started...');
  console.log(`DOM emulation is ${DISABLE_DOM_EMULATION ? 'disabled' : 'enabled'}`);

  if (narrowRun) {
    await benchmarkRun(10000, 20);
  } else {
    await benchmarkRun(10, 1000);
    await benchmarkRun(100, 1000);
    await benchmarkRun(1000, 1000);
  }
}

/**
 *
 * @param rowCount Number of rows rendered in the App
 * @param renderingCount Number of times the app will be rendered
 */
async function benchmarkRun(rowCount: number, renderingCount: number) {
  const measures: Map<string, number[]> = new Map();
  initData(rowCount);

  // Rendering & profiling
  for (let i = 0; i < renderingCount; i++) {
    await render(DISABLE_DOM_EMULATION);
    storePerformanceLogOfCurrentRun(measures);
  }

  const totals = measures.get(`${PERFORMANCE_MARK_PREFIX}:renderApplication`)!;
  const avgTotals = totals.reduce((acc, val) => acc + val, 0) / totals.length;

  let maxNameLength = 0;
  const table = [...measures.entries()]
    .map(([name, durations]) => {
      name = name.substring(PERFORMANCE_MARK_PREFIX.length + 1);
      const level = levels.get(name) ?? 0;
      name = `${new Array(level + 1).join(' ')} ${level ? '└ ' : ''}${name}`;
      maxNameLength = Math.max(name.length, maxNameLength);
      const avg = durations.reduce((acc, val) => acc + val, 0) / durations.length;
      const avgStr = durationToString(avg);
      const percentage = `${((avg / avgTotals) * 100).toFixed(1)}%`;
      const min = durationToString(Math.min(...durations));
      const max = durationToString(Math.max(...durations));
      return {name, min, average: avgStr, percentage, max};
    })
    .map(({name, ...rest}) => {
      // We need this because Node18 aligns text in the middle of the column instead of left).
      const spaces = maxNameLength - name.length;

      return {name: `${name}${' '.repeat(spaces)}`, ...rest};
    });

  // Logging the profiling result as a table
  console.log(`=== table with ${rowCount} rows, with ${renderingCount} renders ===`);
  console.table(table);
  console.log('\n', '\n');
}

function durationToString(duration: number) {
  return `${duration.toFixed(1)}ms`;
}

/**
 * This function mutates the measures map by adding the performance entries.
 * Each entry is sorted, which will make the map keys sorted by startTime
 */
export function storePerformanceLogOfCurrentRun(measures: Map<string, number[]>) {
  const perfEntries = performance.getEntriesByType('measure');
  perfEntries.sort((a, b) => a.startTime - b.startTime);

  for (const {name, duration} of perfEntries) {
    if (!name.startsWith(PERFORMANCE_MARK_PREFIX)) {
      continue;
    }

    const measure = measures.get(name);
    if (!measure) {
      measures.set(name, [duration]);
    } else {
      measure.push(duration);
    }

    performance.clearMeasures(name);
  }
}
