/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BrowserPlatformLocation} from '@angular/platform-browser/src/browser/location/browser_platform_location';
import {supportsState} from '@angular/platform-browser/src/browser/location/history';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('BrowserPlatformLocation', () => {
    let location: BrowserPlatformLocation = null;

    beforeEach(() => location = new BrowserPlatformLocation());

    if (supportsState()) {
      it('should emit popstate event on pushState', () => {
        let emitted: boolean = false;
        const stateObj = {foo: 'bar'};

        location.onPopState(() => emitted = true);

        location.pushState(stateObj, 'page 2', 'bar.html');

        expect(emitted).toBeTruthy();
      });

      it('should emit popstate event on replaceState', () => {
        let emitted: boolean = false;
        const stateObj = {foo: 'bar'};

        location.onPopState(() => emitted = true);

        location.replaceState(stateObj, 'page 3', 'foo.html');

        expect(emitted).toBeTruthy();
      });
    }
  });
}
