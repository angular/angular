/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {verifyNoBrowserErrors} from '@angular/build-tooling/bazel/benchmark/driver-utilities';
import {browser} from 'protractor';

describe('jsonp', function () {
  afterEach(verifyNoBrowserErrors);

  describe('fetching', function () {
    const URL = '/';

    it('should fetch and display people', async function () {
      browser.get(URL);
      expect(await getComponentText('jsonp-app', '.people')).toEqual('hello, caitp');
    });
  });
});

function getComponentText(selector: string, innerSelector: string) {
  return browser.executeScript(
    `return document.querySelector("${selector}").querySelector("${innerSelector}").textContent.trim()`,
  );
}
