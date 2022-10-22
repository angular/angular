/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from '../../../test-utils';

describe('SW `SW_SCRIPT` example', () => {
  const appElem = element(by.css('example-app'));

  afterEach(verifyNoBrowserErrors);

  it('register the SW by factory', () => {
    browser.get(browser.baseUrl);
    expect(appElem.getText()).toBe(`SW script: ${browser.baseUrl}/ngsw-worker.js`);
  });
});
