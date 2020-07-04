/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, By, element} from 'protractor';

import {openBrowser, verifyNoBrowserErrors} from '../../../../dev-infra/benchmark/driver-utilities';

describe('largeform benchmark', () => {
  afterEach(verifyNoBrowserErrors);

  it('should work for ng2', async () => {
    openBrowser({
      url: '/',
      params: [{name: 'copies', value: 1}],
      ignoreBrowserSynchronization: true,
    });
    await $('#createDom').click();
    expect(await element.all(By.css('input[name=value0]')).get(0).getAttribute('value'))
        .toBe('someValue0');
    await $('#destroyDom').click();
    expect(await element.all(By.css('input[name=value0]')).count()).toBe(0);
  });
});
