/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '@angular/testing/src/e2e_util';
import {runBenchmark} from '@angular/testing/src/perf_util';

describe('ng2 compiler benchmark', function() {

  const URL = 'benchmarks/src/compiler/compiler_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  it('should log withBindings stats', function(done) {
    browser.sleep(1000);
    runBenchmark({
      url: URL,
      id: 'ng2.compile.withBindings',
      params: [{name: 'elements', value: 150, scale: 'linear'}],
      work: function() {
        browser.executeScript('document.querySelector("#compileWithBindings").click()');
        browser.sleep(500);
      }
    }).then(done, done.fail);
  });

  it('should log noBindings stats', function(done) {
    browser.sleep(1000);
    runBenchmark({
      url: URL,
      id: 'ng2.compile.noBindings',
      params: [{name: 'elements', value: 150, scale: 'linear'}],
      work: function() {
        browser.executeScript('document.querySelector("#compileNoBindings").click()');
        browser.sleep(500);
      }
    }).then(done, done.fail);
  });

});
