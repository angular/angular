/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '@angular/testing/src/e2e_util';
import {runClickBenchmark} from '@angular/testing/src/perf_util';

describe('ng2 selector benchmark', function() {

  const URL = 'benchmarks/src/compiler/selector_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  it('should log parse stats', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#parse'],
      id: 'ng2.selector.parse',
      params: [{name: 'selectors', value: 10000, scale: 'linear'}],
      waitForAngular2: false
    }).then(done, done.fail);
  });

  it('should log addSelectable stats', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#addSelectable'],
      id: 'ng2.selector.addSelectable',
      params: [{name: 'selectors', value: 10000, scale: 'linear'}],
      waitForAngular2: false
    }).then(done, done.fail);
  });

  it('should log match stats', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#match'],
      id: 'ng2.selector.match',
      params: [{name: 'selectors', value: 10000, scale: 'linear'}],
      waitForAngular2: false
    }).then(done, done.fail);
  });

});
