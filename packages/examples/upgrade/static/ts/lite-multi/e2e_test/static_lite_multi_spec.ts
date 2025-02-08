/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../../test-utils';

describe('upgrade/static (lite with multiple downgraded modules)', () => {
  const navButtons = element.all(by.css('nav button'));
  const mainContent = element(by.css('main'));

  beforeEach(() => browser.get('/'));
  afterEach(verifyNoBrowserErrors);

  it('should correctly bootstrap multiple downgraded modules', () => {
    navButtons.get(1).click();
    expect(mainContent.getText()).toBe('Component B');

    navButtons.get(0).click();
    expect(mainContent.getText()).toBe('Component A | ng1(ng2)');
  });
});
