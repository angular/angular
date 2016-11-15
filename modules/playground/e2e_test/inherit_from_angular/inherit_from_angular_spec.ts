/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser} from 'protractor';

describe('inherit from angular', function() {

  afterEach(verifyNoBrowserErrors);

  describe('inherit from angular app', function() {
    const URL = 'all/playground/src/inherit_from_angular/index.html';

    it('should display that the service was injected properly', function() {
      browser.get(URL);

      expect(getComponentText('my-app', '.service')).toEqual('Your service is present');
    });
  });

});

function getComponentText(selector: string, innerSelector: string) {
  return browser.executeScript(
      'return document.querySelector("' + selector + '").querySelector("' + innerSelector +
      '").textContent');
}
