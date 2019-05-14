/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '../../../e2e_util/perf_util';

describe('benchmarks', () => {

  it('should work for create', done => {
    browser.rootEl = '#root';
    runBenchmark({
      id: 'create',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      prepare: () => $('#reset').click(),
      work: () => $('#init').click()
    }).then(done, done.fail);
  });

});
