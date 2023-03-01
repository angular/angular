/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {browser, by, element, ElementFinder} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../../test-utils';

describe('viewChildren example', () => {
  afterEach(verifyNoBrowserErrors);
  let button: ElementFinder;
  let result: ElementFinder;

  beforeEach(() => {
    browser.get('/di/viewChildren');
    button = element(by.css('button'));
    result = element(by.css('div'));
  });

  it('should query view children', () => {
    expect(result.getText()).toEqual('panes: 1, 2');

    button.click();

    expect(result.getText()).toEqual('panes: 1, 2, 3');
  });
});
