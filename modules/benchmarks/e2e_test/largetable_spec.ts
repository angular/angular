/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {openBrowser, verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {$} from 'protractor';

describe('largetable benchmark spec', () => {

  afterEach(verifyNoBrowserErrors);

  it('should work for ng2', () => {
    testTableBenchmark({
      url: 'all/benchmarks/src/largetable/ng2/index.html',
    });
  });

  it('should work for ng2 switch', () => {
    testTableBenchmark({
      url: 'all/benchmarks/src/largetable/ng2_switch/index.html',
    });
  });

  it('should work for the baseline', () => {
    testTableBenchmark({
      url: 'all/benchmarks/src/largetable/baseline/index.html',
      ignoreBrowserSynchronization: true,
    });
  });

  it('should work for the incremental-dom', () => {
    testTableBenchmark({
      url: 'all/benchmarks/src/largetable/incremental_dom/index.html',
      ignoreBrowserSynchronization: true,
    });
  });

  function testTableBenchmark(openConfig: {url: string, ignoreBrowserSynchronization?: boolean}) {
    openBrowser({
      url: openConfig.url,
      ignoreBrowserSynchronization: openConfig.ignoreBrowserSynchronization,
      params: [{name: 'cols', value: 5}, {name: 'rows', value: 5}],
    });
    $('#createDom').click();
    expect($('#root').getText()).toContain('0/0');
    $('#createDom').click();
    expect($('#root').getText()).toContain('A/A');
    $('#destroyDom').click();
    expect($('#root').getText()).toEqual('');
  }
});
