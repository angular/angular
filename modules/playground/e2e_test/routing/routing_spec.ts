/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser, by, element, ExpectedConditions} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../dev-infra/benchmark/driver-utilities';

function waitForElement(selector: string) {
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(ExpectedConditions.presenceOf($(selector)), 20000);
}

describe('routing inbox-app', () => {
  afterEach(verifyNoBrowserErrors);

  describe('index view', () => {
    const URL = '/';

    it('should list out the current collection of items', () => {
      browser.get(URL);
      waitForElement('.inbox-item-record');
      expect(element.all(by.css('.inbox-item-record')).count()).toEqual(200);
    });
  });
});
