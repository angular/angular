/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '@angular/testing/src/e2e_util';
import {runClickBenchmark} from '@angular/testing/src/perf_util';

describe('ng2 largetable benchmark', function() {

  const URL = 'benchmarks/src/largetable/largetable_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  // Not yet implemented:
  // 'ngBind',
  // 'ngBindOnce',
  // 'ngBindFn',
  // 'ngBindFilter',
  // 'interpolationFilter'

  ['interpolation', 'interpolationAttr', 'interpolationFn'].forEach(function(benchmarkType) {
    it('should log the ng stats with: ' + benchmarkType, function(done) {
      runClickBenchmark({
        url: URL,
        buttons: ['#ng2DestroyDom', '#ng2CreateDom'],
        id: 'ng2.largetable.' + benchmarkType,
        params: [
          {name: 'rows', value: 20, scale: 'sqrt'}, {name: 'columns', value: 20, scale: 'sqrt'},
          {name: 'benchmarkType', value: benchmarkType}
        ]
      }).then(done, done.fail);
    });
  });

  it('should log the baseline stats', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#baselineDestroyDom', '#baselineCreateDom'],
      id: 'baseline.largetable',
      params: [
        {name: 'rows', value: 100, scale: 'sqrt'}, {name: 'columns', value: 20, scale: 'sqrt'},
        {name: 'benchmarkType', value: 'baseline'}
      ]
    }).then(done, done.fail);
  });

});
