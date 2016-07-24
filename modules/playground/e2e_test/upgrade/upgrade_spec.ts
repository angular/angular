/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from "e2e_util/e2e_util";

describe('ngUpgrade', function() {
  var URL = 'all/playground/src/upgrade/index.html';

  beforeEach(function() {
    browser.rootEl = 'body';
    browser.get(URL);
  });

  afterEach(function() {
    (<any>browser).useAllAngular2AppRoots();
    verifyNoBrowserErrors();
  });

  it('should bootstrap Angular 1 and Angular 2 apps together', function() {
    var ng1NameInput = element(by.css('input[ng-model]=name'));
    expect(ng1NameInput.getAttribute('value')).toEqual('World');

    var userSpan = element(by.css('user span'));
    expect(userSpan.getText()).toMatch('/World$/');
  });
});
