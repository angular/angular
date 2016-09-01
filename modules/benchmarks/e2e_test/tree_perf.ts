/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runBenchmark, verifyNoBrowserErrors} from 'e2e_util/perf_util';

describe('tree benchmark perf', () => {

  afterEach(verifyNoBrowserErrors);

  it('should run for ng2', (done) => {
    runTreeBenchmark({
      id: 'deepTree.ng2',
      url: 'all/benchmarks/src/tree/ng2/index.html',
    }).then(done, done.fail);
  });

  it('should run for ng2 static', (done) => {
    runTreeBenchmark({
      id: 'deepTree.ng2.static',
      url: 'all/benchmarks/src/tree/ng2_static/index.html',
    }).then(done, done.fail);
  });

  it('should run for the baseline', (done) => {
    runTreeBenchmark({
      id: 'deepTree.baseline',
      url: 'all/benchmarks/src/tree/baseline/index.html',
      ignoreBrowserSynchronization: true,
    }).then(done, done.fail);
  });

  it('should run for polymer binary tree', (done) => {
    runTreeBenchmark({
      id: 'deepTree.polymer',
      url: 'all/benchmarks/src/tree/polymer/index.html',
      ignoreBrowserSynchronization: true,
    }).then(done, done.fail);
  });

  it('should run for polymer leaves', (done) => {
    runTreeBenchmark({
      id: 'deepTree.polymerLeaves',
      url: 'all/benchmarks/src/tree/polymer_leaves/index.html',
      ignoreBrowserSynchronization: true,
    }).then(done, done.fail);
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
