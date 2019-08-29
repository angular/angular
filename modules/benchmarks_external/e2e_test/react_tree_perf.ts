/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runClickBenchmark, verifyNoBrowserErrors} from '@angular/testing/src/perf_util';

describe('react tree benchmark', function() {

  const URL = 'benchmarks_external/src/tree/react/index.html';

  afterEach(verifyNoBrowserErrors);

  it('should log the stats (create)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#destroyDom', '#createDom'],
      id: 'react.tree.create',
      params: [{name: 'depth', value: 9, scale: 'log2'}],
      waitForAngular2: false
    }).then(done, done.fail);
  });

  it('should log the stats (update)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#createDom'],
      id: 'react.tree.update',
      params: [{name: 'depth', value: 9, scale: 'log2'}],
      waitForAngular2: false
    }).then(done, done.fail);
  });

});
