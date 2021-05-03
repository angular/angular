/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';

import {runBenchmark, verifyNoBrowserErrors} from '../../../../dev-infra/benchmark/driver-utilities';

interface Worker {
  id: string;
  prepare?(): void;
  work(): void;
}

const CreateAndDestroyWorker = {
  id: 'createDestroy',
  work: () => {
    $('#createDom').click();
    $('#destroyDom').click();
  }
};

describe('largeform benchmark spec', () => {
  afterEach(verifyNoBrowserErrors);

  [CreateAndDestroyWorker].forEach((worker) => {
    describe(worker.id, () => {
      it('should run for ng2', async () => {
        await runLargeFormBenchmark({url: '/', id: `largeform.ng2.${worker.id}`, worker: worker});
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
