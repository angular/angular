/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {openBrowser, verifyNoBrowserErrors} from 'e2e_util/e2e_util';

describe('tree benchmark spec', () => {

  afterEach(verifyNoBrowserErrors);

  it('should work for ng2', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/ng2/index.html',
    });
  });

  it('should work for the baseline', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/baseline/index.html',
      ignoreBrowserSynchronization: true,
    });
  });

  it('should work for polymer binary tree', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/polymer/index.html',
      ignoreBrowserSynchronization: true,
    });
  });

  it('should work for polymer leaves', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/polymer_leaves/index.html',
      ignoreBrowserSynchronization: true,
    });
  });

  function testTreeBenchmark(openConfig: {url: string, ignoreBrowserSynchronization?: boolean}) {
    openBrowser(openConfig);
    $('#createDom').click();
    expect($('#root').getText()).toContain('0');
    $('#destroyDom').click();
    expect($('#root').getText()).toEqual('');
  }
});
