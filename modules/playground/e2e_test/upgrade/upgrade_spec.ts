/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser, by, element} from 'protractor';

// TODO(i): re-enable once we are using a version of protractor containing the
// change in https://github.com/angular/protractor/pull/3403
xdescribe('ngUpgrade', function() {
  const URL = 'all/playground/src/upgrade/index.html';

  beforeEach(function() {
    browser.rootEl = 'body';
    (<any>browser).ng12Hybrid = true;
    browser.get(URL);
  });

  afterEach(function() {
    (<any>browser).useAllAngular2AppRoots();
    (<any>browser).ng12Hybrid = false;
    verifyNoBrowserErrors();
  });

  it('should bootstrap AngularJS and Angular apps together', function() {
    const ng1NameInput = element(by.css('input[ng-model="name"]'));
    expect(ng1NameInput.getAttribute('value')).toEqual('World');

    const userSpan = element(by.css('user span'));
    expect(userSpan.getText()).toMatch(/World$/);
  });
});
