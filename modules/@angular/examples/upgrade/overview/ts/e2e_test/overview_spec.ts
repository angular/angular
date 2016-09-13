/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from '../../../../_common/e2e_util';

function waitForElement(selector: string) {
  const EC = (<any>protractor).ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('upgrade', () => {
  afterEach(verifyNoBrowserErrors);

  describe('overview', () => {
    const URL = '/upgrade/overview/ts/';

    it('should render', () => {
      // Remove after protractor gains better support for ng-upgrade
      browser.ignoreSynchronization = true;
      browser.driver.executeScript('window.name = \'\'');
      browser.driver.get(browser.baseUrl + URL);
      browser.sleep(500);
      expect(element.all(by.css('example-app')).get(0).getText())
          .toEqual('ng2[ng1[Hello !](transclude)]( loading... )');
      browser.ignoreSynchronization = false;
    });
  });
});
