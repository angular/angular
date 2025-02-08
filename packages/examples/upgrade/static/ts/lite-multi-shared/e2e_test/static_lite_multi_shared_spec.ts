/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../../test-utils';

describe('upgrade/static (lite with multiple downgraded modules and shared root module)', () => {
  const compA = element(by.css('ng2-a'));
  const compB = element(by.css('ng2-b'));
  const compC = element(by.css('ng2-c'));

  beforeEach(() => browser.get('/'));
  afterEach(verifyNoBrowserErrors);

  it('should share the same injectable instance across downgraded modules A and B', () => {
    expect(compA.getText()).toBe('Component A (Service ID: 2)');
    expect(compB.getText()).toBe('Component B (Service ID: 2)');
  });

  it('should use a different injectable instance on downgraded module C', () => {
    expect(compC.getText()).toBe('Component C (Service ID: 1)');
  });
});
