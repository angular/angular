/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  openBrowser,
  verifyNoBrowserErrors,
} from '@angular/build-tooling/bazel/benchmark/driver-utilities';
import {$, By, element} from 'protractor';

describe('largeform benchmark', () => {
  afterEach(verifyNoBrowserErrors);

  it('should work for ng2', async () => {
    openBrowser({
      url: '/',
      params: [{name: 'copies', value: 1}],
      ignoreBrowserSynchronization: true,
    });
    await $('#createDom').click();
    expect(await element.all(By.css('input[name=value0]')).get(0).getAttribute('value')).toBe(
      'someValue0',
    );
    await $('#destroyDom').click();
    expect(await element.all(By.css('input[name=value0]')).count()).toBe(0);
  });
});
