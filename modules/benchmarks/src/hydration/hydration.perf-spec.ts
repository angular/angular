/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runBenchmark, verifyNoBrowserErrors} from '../../../utilities/index';
import {$} from 'protractor';

interface Worker {
  id: string;
  prepare?(): void;
  work(): void;
}

const CreateWorker: Worker = {
  id: 'create',
  prepare: () => $('#prepare').click(),
  work: () => $('#createDom').click(),
};

const UpdateWorker: Worker = {
  id: 'update',
  prepare: () => {
    $('#prepare').click();
    $('#createDom').click();
  },
  work: () => $('#updateDom').click(),
};

// In order to make sure that we don't change the ids of the benchmarks, we need to
// determine the current test package name from the Bazel target. This is necessary
// because previous to the Bazel conversion, the benchmark test ids contained the test
// name. e.g. "largeTable.ng2_switch.createDestroy". We determine the name of the
// Bazel package where this test runs from the current test target. The Bazel target
// looks like: "//modules/benchmarks/src/largetable/{pkg_name}:{target_name}".
const testPackageName = process.env['JS_BINARY__TARGET']!.split(':')[0].split('/').pop();

describe('hydration benchmark perf', () => {
  afterEach(verifyNoBrowserErrors);

  [CreateWorker, UpdateWorker].forEach((worker) => {
    describe(worker.id, () => {
      it(`should run benchmark for ${testPackageName}`, async () => {
        await runTableBenchmark({
          id: `hydration.${testPackageName}.${worker.id}`,
          url: '/',
          ignoreBrowserSynchronization: true,
          worker,
        });
      });
    });
  });
});

function runTableBenchmark(config: {
  id: string;
  url: string;
  ignoreBrowserSynchronization?: boolean;
  worker: Worker;
}) {
  return runBenchmark({
    id: config.id,
    url: config.url,
    ignoreBrowserSynchronization: config.ignoreBrowserSynchronization,
    params: [
      {name: 'cols', value: 40},
      {name: 'rows', value: 200},
    ],
    prepare: config.worker.prepare,
    work: config.worker.work,
  });
}
