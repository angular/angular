/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '@angular/testing/src/e2e_util';
import {runClickBenchmark} from '@angular/testing/src/perf_util';

describe('ng2 cost benchmark', function() {

  const URL = 'benchmarks/src/costs/index.html';

  // Number of components to create in a single iteration
  const benchmarkSize = 200;

  afterEach(verifyNoBrowserErrors);

  it('should log stats for baseline (plain components)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#reset', '#createPlainComponents'],
      id: 'ng2.costs.baseline',
      params: [{name: 'size', value: benchmarkSize, scale: 'linear'}]
    }).then(done, done.fail);
  });

  it('should log stats for components with decorators', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#reset', '#createComponentsWithDirectives'],
      id: 'ng2.costs.decorators',
      params: [{name: 'size', value: benchmarkSize, scale: 'linear'}]
    }).then(done, done.fail);
  });

  it('should log stats for dynamic components', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#reset', '#createDynamicComponents'],
      id: 'ng2.costs.dynamic',
      params: [{name: 'size', value: benchmarkSize, scale: 'linear'}]
    }).then(done, done.fail);
  });
});
