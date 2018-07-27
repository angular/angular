/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark, verifyNoBrowserErrors} from 'e2e_util/perf_util';
import {$} from 'protractor';

interface Worker {
  id: string;
  prepare?(): void;
  work(): void;
}

const CreateAndDestroyWorker: Worker = {
  id: 'createDestroy',
  work: () => {
    $('#createDom').click();
    $('#destroyDom').click();
  }
};

describe('largeform benchmark perf', () => {

  afterEach(verifyNoBrowserErrors);

  [CreateAndDestroyWorker].forEach((worker) => {
    describe(worker.id, () => {
      it('should run for ng2', done => {
        runLargeFormBenchmark({
          id: `largeform.ng2.${worker.id}`,
          url: 'all/benchmarks/src/largeform/ng2/index.html',
          worker: worker
        }).then(done, done.fail);
      });
    });
  });

  function runLargeFormBenchmark(
      config: {id: string, url: string, ignoreBrowserSynchronization?: boolean, worker: Worker}) {
    return runBenchmark({
      id: config.id,
      url: config.url,
      params: [{name: 'copies', value: 8}],
      ignoreBrowserSynchronization: config.ignoreBrowserSynchronization,
      prepare: config.worker.prepare,
      work: config.worker.work
    });
  }
});
