/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '@angular/build-tooling/bazel/benchmark/driver-utilities';
import {browser} from 'protractor';

describe('Person Management CRUD', function() {
  const URL = '/';

  it('should work', function() {
    browser.get(URL);
    verifyNoBrowserErrors();
  });
});
