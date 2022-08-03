/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark, verifyNoBrowserErrors} from '@angular/build-tooling/bazel/benchmark/driver-utilities';
import {$} from 'protractor';

interface Worker {
  id: string;
  prepare?(): void;
  work(): void;
}

// Used to benchmark performance when insertion tree is not dirty.
const InsertionNotDirtyWorker: Worker = {
  id: 'insertionNotDirty',
  prepare: () => {
    $('#destroyDom').click();
    $('#createDom').click();
  },
  work: () => $('#detectChanges').click()
};

// Used to benchmark performance when both declaration and insertion trees are dirty.
const AllComponentsDirtyWorker: Worker = {
  id: 'allComponentsDirty',
  prepare: () => {
    $('#destroyDom').click();
    $('#createDom').click();
    $('#markInsertionComponentForCheck').click();
  },
  work: () => $('#detectChanges').click()
};


// In order to make sure that we don't change the ids of the benchmarks, we need to
// determine the current test package name from the Bazel target. This is necessary
// because previous to the Bazel conversion, the benchmark test ids contained the test
// name. We determine the name of the Bazel package where this test runs from the current test
// target. The Bazel target
// looks like: "//modules/benchmarks/src/change_detection/{pkg_name}:{target_name}".
const testPackageName = process.env['BAZEL_TARGET']!.split(':')[0].split('/').pop();

describe('change detection benchmark perf', () => {
  afterEach(verifyNoBrowserErrors);

  [InsertionNotDirtyWorker, AllComponentsDirtyWorker].forEach((worker) => {
    describe(worker.id, () => {
      it(`should run benchmark for ${testPackageName}`, async () => {
        await runChangeDetectionBenchmark({
          id: `change_detection.${testPackageName}.${worker.id}`,
          url: '/',
          ignoreBrowserSynchronization: true,
          worker: worker
        });
      });
    });
  });
});

function runChangeDetectionBenchmark(
    config: {id: string, url: string, ignoreBrowserSynchronization?: boolean, worker: Worker}) {
  return runBenchmark({
    id: config.id,
    url: config.url,
    ignoreBrowserSynchronization: config.ignoreBrowserSynchronization,
    params: [{name: 'viewCount', value: 10}],
    prepare: config.worker.prepare,
    work: config.worker.work
  });
}
