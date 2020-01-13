/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, By, element} from 'protractor';

import {openBrowser, verifyNoBrowserErrors} from '../../../e2e_util/e2e_util';

describe('largeform benchmark', () => {

  afterEach(verifyNoBrowserErrors);

  it('should work for ng2', () => {
    openBrowser({
      url: '/',
      params: [{name: 'copies', value: 1}],
      ignoreBrowserSynchronization: true,
    });
    $('#createDom').click();
    expect(element.all(By.css('input[name=value0]')).get(0).getAttribute('value'))
        .toBe('someValue0');
    $('#destroyDom').click();
    expect(element.all(By.css('input[name=value0]')).count()).toBe(0);
  });
});
