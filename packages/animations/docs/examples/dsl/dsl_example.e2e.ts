/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, ExpectedConditions, browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../private/testing/e2e';


describe('animation example', () => {
  afterEach(verifyNoBrowserErrors);

  describe('index view', () => {
    it('should list out the current collection of items', () => {
      browser.get('/');
      waitForElement('.toggle-container');
      expect(element.all(by.css('.toggle-container')).get(0).getText())
          .toEqual(
              'Look at this box' as
                  any /** TODO: seems that we have bad typing somewhere, getText() returns Promise<string> */);
    });
  });
});


function waitForElement(selector: string) {
  const EC = ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}