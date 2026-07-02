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

describe('ngIf', () => {
  const URL = '/ngIf';
  afterEach(verifyNoBrowserErrors);

  describe('ng-if-simple', () => {
    let comp = 'ng-if-simple';
    it('should hide/show content', () => {
      browser.get(URL);
      waitForElement(comp);
      expect(element.all(by.css(comp)).get(0).getText()).toEqual('hide show = true\nText to show');
      element(by.css(comp + ' button')).click();
      expect(element.all(by.css(comp)).get(0).getText()).toEqual('show show = false');
    });
  });

  describe('ng-if-else', () => {
    let comp = 'ng-if-else';
    it('should hide/show content', () => {
      browser.get(URL);
      waitForElement(comp);
      expect(element.all(by.css(comp)).get(0).getText()).toEqual('hide show = true\nText to show');
      element(by.css(comp + ' button')).click();
      expect(element.all(by.css(comp)).get(0).getText()).toEqual(
        'show show = false\nAlternate text while primary text is hidden',
      );
    });
  });

  describe('ng-if-then-else', () => {
    let comp = 'ng-if-then-else';

    it('should hide/show content', () => {
      browser.get(URL);
      waitForElement(comp);
      expect(element.all(by.css(comp)).get(0).getText()).toEqual(
        'hideSwitch Primary show = true\nPrimary text to show',
      );
      element
        .all(by.css(comp + ' button'))
        .get(1)
        .click();
      expect(element.all(by.css(comp)).get(0).getText()).toEqual(
        'hideSwitch Primary show = true\nSecondary text to show',
      );
      element
        .all(by.css(comp + ' button'))
        .get(0)
        .click();
      expect(element.all(by.css(comp)).get(0).getText()).toEqual(
        'showSwitch Primary show = false\nAlternate text while primary text is hidden',
      );
    });
  });

  describe('ng-if-as', () => {
    let comp = 'ng-if-as';
    it('should hide/show content', () => {
      browser.get(URL);
      waitForElement(comp);
      expect(element.all(by.css(comp)).get(0).getText()).toEqual(
        'Next User\nWaiting... (user is null)',
      );
      element(by.css(comp + ' button')).click();
      expect(element.all(by.css(comp)).get(0).getText()).toEqual('Next User\nHello Smith, John!');
    });
  });
});
