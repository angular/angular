/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../test-utils';

describe('SW `SwPush` example', () => {
  const pageUrl = '/push';
  const appElem = element(by.css('example-app'));

  afterEach(verifyNoBrowserErrors);

  it('should be enabled', () => {
    browser.get(pageUrl);
    expect(appElem.getText()).toBe('SW enabled: true');
  });
});
