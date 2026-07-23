/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../test-utils';

describe('SW `SwRegistrationOptions` example', () => {
  const pageUrl = '/registration-options';
  const appElem = element(by.css('example-app'));

  afterEach(verifyNoBrowserErrors);

  it('not register the SW by default', () => {
    browser.get(pageUrl);
    expect(appElem.getText()).toBe('SW enabled: false');
  });

  it('register the SW when navigating to `?sw=true`', () => {
    browser.get(`${pageUrl}?sw=true`);
    expect(appElem.getText()).toBe('SW enabled: true');
  });
});
