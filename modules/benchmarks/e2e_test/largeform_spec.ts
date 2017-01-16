/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {openBrowser, verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {$, By, element} from 'protractor';

describe('largeform benchmark spec', () => {

  afterEach(verifyNoBrowserErrors);

  it('should work for ng2', () => {
    testLargeformBenchmark({
      url: 'all/benchmarks/src/largeform/ng2/index.html',
    });
  });

  function testLargeformBenchmark(
      openConfig: {url: string, ignoreBrowserSynchronization?: boolean}) {
    openBrowser({
      url: openConfig.url,
      params: [{name: 'copies', value: 1}],
      ignoreBrowserSynchronization: openConfig.ignoreBrowserSynchronization,
    });
    $('#createDom').click();
    expect(element.all(By.css('input[name=value0]')).get(0).getAttribute('value'))
        .toBe('someValue0');
    $('#destroyDom').click();
    expect(element.all(By.css('input[name=value0]')).count()).toBe(0);
  }
});
