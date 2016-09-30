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

  it('should work for ng2 ftl', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/ng2_ftl/index.html',
      // Can't use bundles as we use AoT generated code
      // which relies on deep imports
      extraParams: [{name: 'bundles', value: false}]
    });
  });

  it('should work for ng2 static', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/ng2_static/index.html',
    });
  });

  it('should work for ng2 static ftl', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/ng2_static_ftl/index.html',
      // Can't use bundles as we use AoT generated code
      // which relies on deep imports
      extraParams: [{name: 'bundles', value: false}]
    });
  });

  it('should work for ng2 switch', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/ng2_switch/index.html',
    });
  });

  it('should work for the baseline', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/baseline/index.html',
      ignoreBrowserSynchronization: true,
    });
  });

  it('should work for incremental dom', () => {
    testTreeBenchmark({
      url: 'all/benchmarks/src/tree/incremental_dom/index.html',
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

  function testTreeBenchmark(openConfig: {
    url: string,
    ignoreBrowserSynchronization?: boolean,
    extraParams?: {name: string, value: any}[]
  }) {
    let params = [{name: 'depth', value: 4}];
    if (openConfig.extraParams) {
      params = params.concat(openConfig.extraParams);
    }
    openBrowser({
      url: openConfig.url,
      ignoreBrowserSynchronization: openConfig.ignoreBrowserSynchronization,
      params: params,
    });
    $('#createDom').click();
    expect($('#root').getText()).toContain('0');
    $('#createDom').click();
    expect($('#root').getText()).toContain('A');
    $('#destroyDom').click();
    expect($('#root').getText()).toEqual('');
  }
});
