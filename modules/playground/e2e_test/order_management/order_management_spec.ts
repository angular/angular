/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser} from 'protractor';

import {verifyNoBrowserErrors} from '../../../e2e_util/e2e_util';

describe('Order Management CRUD', function() {
  const URL = '/';

  it('should work', function() {
    browser.get(URL);
    verifyNoBrowserErrors();
  });
});
