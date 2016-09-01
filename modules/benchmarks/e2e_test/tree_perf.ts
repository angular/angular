/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark, verifyNoBrowserErrors} from 'e2e_util/perf_util';

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

describe('tree benchmark perf', () => {

  afterEach(verifyNoBrowserErrors);

  [CreateOnlyWorker, CreateAndDestroyWorker, UpdateWorker].forEach((worker) => {
    describe(worker.id, () => {

      it('should run for ng2', (done) => {
        runTreeBenchmark({
          id: `deepTree.ng2.${worker.id}`,
          url: 'all/benchmarks/src/tree/ng2/index.html',
        }).then(done, done.fail);
      });

      it('should run for ng2 static', (done) => {
        runTreeBenchmark({
          id: `deepTree.ng2.static.${worker.id}`,
          url: 'all/benchmarks/src/tree/ng2_static/index.html',
        }).then(done, done.fail);
      });

      it('should run for ng2 switch', (done) => {
        runTreeBenchmark({
          id: `deepTree.ng2_switch.${worker.id}`,
          url: 'all/benchmarks/src/tree/ng2_switch/index.html',
        }).then(done, done.fail);
      });

      it('should run for the baseline', (done) => {
        runTreeBenchmark({
          id: `deepTree.baseline.${worker.id}`,
          url: 'all/benchmarks/src/tree/baseline/index.html',
          ignoreBrowserSynchronization: true,
        }).then(done, done.fail);
      });

      it('should run for incremental-dom', (done) => {
        runTreeBenchmark({
          id: `deepTree.incremental_dom.${worker.id}`,
          url: 'all/benchmarks/src/tree/incremental_dom/index.html',
          ignoreBrowserSynchronization: true,
        }).then(done, done.fail);
      });

      it('should run for polymer binary tree', (done) => {
        runTreeBenchmark({
          id: `deepTree.polymer.${worker.id}`,
          url: 'all/benchmarks/src/tree/polymer/index.html',
          ignoreBrowserSynchronization: true,
        }).then(done, done.fail);
      });

      it('should run for polymer leaves', (done) => {
        runTreeBenchmark({
          id: `deepTree.polymer_leaves.${worker.id}`,
          url: 'all/benchmarks/src/tree/polymer_leaves/index.html',
          ignoreBrowserSynchronization: true,
        }).then(done, done.fail);
      });
    });
  });

  function runTreeBenchmark(
      config: {id: string, url: string, ignoreBrowserSynchronization?: boolean}) {
    return runBenchmark({
      id: config.id,
      url: config.url,
      ignoreBrowserSynchronization: config.ignoreBrowserSynchronization,
      params: [{name: 'depth', value: 9}],
      work: () => {
        $('#createDom').click();
        $('#destroyDom').click();
      }
    });
  }
});
