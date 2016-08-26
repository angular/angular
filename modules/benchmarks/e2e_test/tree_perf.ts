/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';

const useBundles = false;

describe('tree benchmark', function() {

  afterEach(verifyNoBrowserErrors);

  it('should work for the baseline', function() {
    browser.ignoreSynchronization = true;
    browser.get(`all/benchmarks/src/tree/baseline/index.html?bundles=${useBundles}`);
    $('#createDom').click();
    expect($('baseline').getText()).toContain('0');
  });

  it('should work for ng2', function() {
    browser.get(`all/benchmarks/src/tree/ng2/index.html?bundles=${useBundles}`);
    $('#createDom').click();
    expect($('app').getText()).toContain('0');
  });

  it('should work for polymer', function() {
    browser.ignoreSynchronization = true;
    browser.get(`all/benchmarks/src/tree/polymer/index.html?bundles=${useBundles}`);
    $('#createDom').click();
    expect($('#app').getText()).toContain('0');
  });

});
