/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark, verifyNoBrowserErrors} from 'e2e_util/perf_util';
import {$, browser} from 'protractor';

import {Benchmark, Benchmarks, CreateBtn, DestroyBtn, DetectChangesBtn, RootEl} from './tree_data';

describe('tree benchmark perf', () => {

  let _oldRootEl: any;
  beforeEach(() => _oldRootEl = browser.rootEl);

  afterEach(() => {
    browser.rootEl = _oldRootEl;
    verifyNoBrowserErrors();
  });

  Benchmarks.forEach(benchmark => {
    describe(benchmark.id, () => {
      it('should work for createOnly', (done) => {
        runTreeBenchmark({
          id: 'createOnly',
          benchmark,
          prepare: () => $(CreateBtn).click(),
          work: () => $(DestroyBtn).click()
        }).then(done, done.fail);
      });

      it('should work for createDestroy', (done) => {
        runTreeBenchmark({
          id: 'createDestroy',
          benchmark,
          work: () => {
            $(DestroyBtn).click();
            $(CreateBtn).click();
          }
        }).then(done, done.fail);
      });

      it('should work for update', (done) => {
        runTreeBenchmark({id: 'update', benchmark, work: () => $(CreateBtn).click()})
            .then(done, done.fail);
      });

      if (benchmark.buttons.indexOf(DetectChangesBtn) !== -1) {
        it('should work for detectChanges', (done) => {
          runTreeBenchmark({
            id: 'detectChanges',
            benchmark,
            work: () => $(DetectChangesBtn).click(),
            setup: () => $(DestroyBtn).click()
          }).then(done, done.fail);
        });
      }

    });
  });
});

function runTreeBenchmark({id, benchmark, prepare, setup, work}: {
  id: string; benchmark: Benchmark, prepare ? () : void; setup ? () : void; work(): void;
}) {
  let params = [{name: 'depth', value: 11}];
  if (benchmark.extraParams) {
    params = params.concat(benchmark.extraParams);
  }
  browser.rootEl = RootEl;
  return runBenchmark({
    id: `${benchmark.id}.${id}`,
    url: benchmark.url,
    ignoreBrowserSynchronization: benchmark.ignoreBrowserSynchronization,
    params: params,
    work: work,
    prepare: prepare,
    setup: setup
  });
}
