/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser} from 'protractor';

describe('http', function() {

  afterEach(verifyNoBrowserErrors);

  describe('fetching', function() {
    const URL = 'all/playground/src/http/index.html';

    it('should fetch and display people', function() {
      browser.get(URL);
      expect(getComponentText('http-app', '.people')).toEqual('hello, Jeff');
    });
  });
});

function getComponentText(selector: string, innerSelector: string) {
  return browser.executeScript(
      `return document.querySelector("${selector}").querySelector("${innerSelector}").textContent.trim()`);
}
