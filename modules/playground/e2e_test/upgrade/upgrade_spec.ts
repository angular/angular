/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from "e2e_util/e2e_util";

// TODO(i): reenable once we fix issue with exposing testability to protractor when using ngUpgrade
// https://github.com/angular/angular/issues/9407
xdescribe('ngUpgrade', function() {
  var URL = 'all/playground/src/upgrade/index.html';

  beforeEach(function() { browser.get(URL); });

  afterEach(verifyNoBrowserErrors);

  it('should bootstrap Angular 1 and Angular 2 apps together', function() {
    var ng1NameInput = element(by.css('input[ng-model]=name'));
    expect(ng1NameInput.getAttribute('value')).toEqual('World');

    var userSpan = element(by.css('user span'));
    expect(userSpan.getText()).toMatch('/World$/');
  });
});
