/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {verifyNoBrowserErrors} from '../../../utilities/index';
import {browser, by, element} from 'protractor';

describe('ngUpgrade', function () {
  const URL = '/';

  beforeEach(function () {
    browser.rootEl = 'body';
    browser.get(URL);
  });

  afterEach(function () {
    browser.useAllAngular2AppRoots();
    verifyNoBrowserErrors();
  });

  it('should bootstrap AngularJS and Angular apps together', function () {
    const ng1NameInput = element(by.css('input[ng-model="name"]'));
    expect(ng1NameInput.getAttribute('value')).toEqual('World');

    const projectedGreetingEl = element(by.css('.projected-content .greeting'));
    const upgradedNg1ComponentEl = element(by.css('ng1-user'));

    expect(projectedGreetingEl.getText()).toMatch(/World!$/);
    expect(upgradedNg1ComponentEl.getText()).toMatch(/^User: World/);
  });
});
