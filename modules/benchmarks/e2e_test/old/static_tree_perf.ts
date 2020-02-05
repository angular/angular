/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '@angular/testing/src/e2e_util';
import {runClickBenchmark} from '@angular/testing/src/perf_util';

describe('ng2 static tree benchmark', function() {

  const URL = 'benchmarks/src/static_tree/tree_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  it('should log the ng stats', async() => {
    runClickBenchmark({
      url: URL,
      buttons: ['#ng2DestroyDom', '#ng2CreateDom'],
      id: 'ng2.static.tree.create.plain',
      params: []
    });
  });

  it('should log the ng stats (update)', async() => {
    runClickBenchmark({
      url: URL,
      buttons: ['#ng2CreateDom'],
      id: 'ng2.static.tree.update',
      params: [],
    });
  });

  it('should log the baseline stats', async() => {
    runClickBenchmark({
      url: URL,
      buttons: ['#baselineDestroyDom', '#baselineCreateDom'],
      id: 'baseline.static.tree.create',
      params: []
    });
  });

  it('should log the baseline stats (update)', async() => {
    runClickBenchmark(
        {url: URL, buttons: ['#baselineCreateDom'], id: 'baseline.static.tree.update', params: []});
  });

});
