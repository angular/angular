/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark, verifyNoBrowserErrors} from 'e2e_util/perf_util';

describe('tree benchmark', () => {

  afterEach(verifyNoBrowserErrors);

  it('should work for the baseline', (done) => {
    runBenchmark({
      id: 'deepTree.baseline',
      url: 'all/benchmarks/src/tree/baseline/index.html',
      ignoreBrowserSynchronization: true,
      params: [{name: 'depth', value: 9}],
      work: () => {
        $('#createDom').click();
        $('#destroyDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for ng2', (done) => {
    runBenchmark({
      id: 'deepTree.ng2',
      url: 'all/benchmarks/src/tree/ng2/index.html',
      params: [{name: 'depth', value: 9}],
      work: () => {
        $('#createDom').click();
        $('#destroyDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for polymer binary tree', (done) => {
    runBenchmark({
      id: 'deepTree.polymer',
      url: 'all/benchmarks/src/tree/polymer/index.html',
      ignoreBrowserSynchronization: true,
      params: [{name: 'depth', value: 9}],
      work: () => {
        $('#createDom').click();
        $('#destroyDom').click();
      }
    }).then(done, done.fail);
  });

  it('should work for polymer leaves', (done) => {
    runBenchmark({
      id: 'deepTree.polymerLeaves',
      url: 'all/benchmarks/src/tree/polymer_leaves/index.html',
      ignoreBrowserSynchronization: true,
      params: [{name: 'depth', value: 9}],
      work: () => {
        $('#createDom').click();
        $('#destroyDom').click();
      }
    }).then(done, done.fail);
  });
});
