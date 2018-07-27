/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';

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

describe('largetable benchmark perf', () => {

  afterEach(verifyNoBrowserErrors);

  [CreateOnlyWorker, CreateAndDestroyWorker, UpdateWorker].forEach((worker) => {
    describe(worker.id, () => {
      it('should run for render3', done => {
        runTableBenchmark({
          id: `largeTable.render3.${worker.id}`,
          url: 'index.html',
          ignoreBrowserSynchronization: true,
          worker: worker
        }).then(done, done.fail);
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
});
