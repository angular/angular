/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, By, element} from 'protractor';

import {openBrowser, verifyNoBrowserErrors} from '../../../e2e_util/e2e_util';
import {runBenchmark} from '../../../e2e_util/perf_util';

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

  it('should work for ng2', () => {
    openBrowser({
      url: '/',
      params: [{name: 'copies', value: 1}],
      ignoreBrowserSynchronization: true,
    });
    $('#createDom').click();
    expect(element.all(By.css('input[name=value0]')).get(0).getAttribute('value'))
        .toBe('someValue0');
    $('#destroyDom').click();
    expect(element.all(By.css('input[name=value0]')).count()).toBe(0);
  });

  [CreateAndDestroyWorker].forEach((worker) => {
    describe(worker.id, () => {
      it('should run for ng2', done => {
        runLargeFormBenchmark({url: '/', id: `largeform.ng2.${worker.id}`, worker: worker})
            .then(done, done.fail);
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
