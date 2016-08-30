/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {openBrowser, verifyNoBrowserErrors} from 'e2e_util/e2e_util';

const useBundles = false;

describe('tree benchmark', function() {

  afterEach(verifyNoBrowserErrors);

  it('should work for the baseline', function() {
    openBrowser({
      url: 'all/benchmarks/src/tree/baseline/index.html',
      ignoreBrowserSynchronization: true,
    });
    $('#createDom').click();
    expect($('baseline').getText()).toContain('0');
  });

  it('should work for ng2', function() {
    openBrowser({
      url: 'all/benchmarks/src/tree/ng2/index.html',
    });
    $('#createDom').click();
    expect($('app').getText()).toContain('0');
  });

  it('should work for polymer', function() {
    openBrowser({
      url: 'all/benchmarks/src/tree/polymer/index.html',
      ignoreBrowserSynchronization: true,
    });
    $('#createDom').click();
    expect($('#app').getText()).toContain('0');
  });

});
