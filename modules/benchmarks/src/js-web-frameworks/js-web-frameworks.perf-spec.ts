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

const Create1KWorker: Worker = {
  id: 'create1K',
  prepare: () => $('#deleteAll').click(),
  work: () => $('#create1KRows').click(),
};

const Delete1KWorker: Worker = {
  id: 'delete1K',
  prepare: () => $('#create1KRows').click(),
  work: () => {
    $('#deleteAll').click();
  },
};

const SelectWorker: Worker = {
  id: 'select',
  prepare: () => $('#create1KRows').click(),
  work: () => {
    $('tbody>tr:nth-of-type(2)>td:nth-of-type(2)>a').click();
  },
};

const UpdateWorker: Worker = {
  id: 'update',
  prepare: () => $('#create1KRows').click(),
  work: () => {
    $('#update').click();
  },
};

const SwapWorker: Worker = {
  id: 'swap',
  prepare: () => $('#create1KRows').click(),
  work: () => {
    $('#swap').click();
  },
};

// In order to make sure that we don't change the ids of the benchmarks, we need to
// determine the current test package name from the Bazel target. This is necessary
// because previous to the Bazel conversion, the benchmark test ids contained the test
// name. e.g. "largeTable.ng2_switch.createDestroy". We determine the name of the
// Bazel package where this test runs from the current test target. The Bazel target
// looks like: "//modules/benchmarks/src/largetable/{pkg_name}:{target_name}".
const testPackageName = process.env['JS_BINARY__TARGET']!.split(':')[0].split('/').pop();

describe('js-web-frameworks benchmark perf', () => {
  afterEach(verifyNoBrowserErrors);

  [Create1KWorker, Delete1KWorker, UpdateWorker, SelectWorker, SwapWorker].forEach((worker) => {
    describe(worker.id, () => {
      it(`should run benchmark for ${testPackageName}`, async () => {
        await runTableBenchmark({
          id: `js-web-frameworks.${testPackageName}.${worker.id}`,
          url: '/',
          ignoreBrowserSynchronization: true,
          worker: worker,
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
    params: [],
    prepare: config.worker.prepare,
    work: config.worker.work,
  });
}
