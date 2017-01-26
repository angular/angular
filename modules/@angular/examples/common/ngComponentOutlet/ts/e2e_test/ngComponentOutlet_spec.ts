/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, ExpectedConditions, browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

function waitForElement(selector: string) {
  const EC = ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('ngComponentOutlet', () => {
  const URL = 'common/ngComponentOutlet/ts/';
  afterEach(verifyNoBrowserErrors);

  describe('ng-component-outlet-example', () => {
    it('should render simple', () => {
      browser.get(URL);
      waitForElement('ng-component-outlet-simple-example');
      expect(element.all(by.css('hello-world')).getText()).toEqual(['Hello World!']);
    });

    it('should render complete', () => {
      browser.get(URL);
      waitForElement('ng-component-outlet-complete-example');
      expect(element.all(by.css('complete-component')).getText()).toEqual(['Complete: Ahoj Svet!']);
    });

    it('should render other module', () => {
      browser.get(URL);
      waitForElement('ng-component-outlet-other-module-example');
      expect(element.all(by.css('other-module-component')).getText()).toEqual([
        'Other Module Component!'
      ]);
    });
  });
});
