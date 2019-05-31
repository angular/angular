/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';

import {openBrowser} from '../../../e2e_util/e2e_util';
import {runBenchmark, verifyNoBrowserErrors} from '../../../e2e_util/perf_util';

interface Worker {
  id: string;
  prepare?(): void;
  work(): void;
}

const CreateOnlyWorker: Worker = {
  id: 'createOnly',
  prepare: () => $('#destroyDom').click(),
  work: () => $('#createDom').click()
};

const CreateAndDestroyWorker: Worker = {
  id: 'createDestroy',
  work: () => {
    $('#createDom').click();
    $('#destroyDom').click();
  }
};

const UpdateWorker: Worker = {
  id: 'update',
  work: () => $('#createDom').click()
};

// In order to make sure that we don't change the ids of the benchmarks, we need to
// determine the current test package name from the Bazel target. This is necessary
// because previous to the Bazel conversion, the benchmark test ids contained the test
// name. e.g. "largeTable.ng2_switch.createDestroy". We determine the name of the
// Bazel package where this test runs from the current test target. The Bazel target
// looks like: "//modules/benchmarks/src/largetable/{pkg_name}:{target_name}".
const testPackageName = process.env['BAZEL_TARGET'] !.split(':')[0].split('/').pop();

describe('largetable benchmark perf', () => {

  afterEach(verifyNoBrowserErrors);

  it(`should render the table for ${testPackageName}`, () => {
    openBrowser({
      url: '',
      ignoreBrowserSynchronization: true,
      params: [{name: 'cols', value: 5}, {name: 'rows', value: 5}],
    });
    $('#createDom').click();
    expect($('#root').getText()).toContain('0/0');
    $('#createDom').click();
    expect($('#root').getText()).toContain('A/A');
    $('#destroyDom').click();
    expect($('#root').getText() as any).toEqual('');
  });

  [CreateOnlyWorker, CreateAndDestroyWorker, UpdateWorker].forEach((worker) => {
    describe(worker.id, () => {
      it(`should run benchmark for ${testPackageName}`, done => {
        runTableBenchmark({
          id: `largeTable.${testPackageName}.${worker.id}`,
          url: '/',
          ignoreBrowserSynchronization: true,
          worker: worker
        }).then(done, done.fail);
      });
    });
  });
});

function runTableBenchmark(
    config: {id: string, url: string, ignoreBrowserSynchronization?: boolean, worker: Worker}) {
  return runBenchmark({
    id: config.id,
    url: config.url,
    ignoreBrowserSynchronization: config.ignoreBrowserSynchronization,
    params: [{name: 'cols', value: 40}, {name: 'rows', value: 200}],
    prepare: config.worker.prepare,
    work: config.worker.work
  });
}
