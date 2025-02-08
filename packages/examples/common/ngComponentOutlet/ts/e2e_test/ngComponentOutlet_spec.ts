/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {$, browser, by, element, ExpectedConditions} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../test-utils';

function waitForElement(selector: string) {
  const EC = ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('ngComponentOutlet', () => {
  const URL = '/ngComponentOutlet';
  afterEach(verifyNoBrowserErrors);

  describe('ng-component-outlet-example', () => {
    it('should render simple', () => {
      browser.get(URL);
      waitForElement('ng-component-outlet-simple-example');
      expect(element.all(by.css('hello-world')).getText()).toEqual(['Hello World!']);
    });
  });
});
