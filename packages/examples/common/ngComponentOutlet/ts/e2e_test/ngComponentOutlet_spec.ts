/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {modifiedInIvy} from '@angular/private/testing';
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

    modifiedInIvy('Different behavior for projectableNodes in ViewContainerRef.createComponent')
        .it('should render complete', () => {
          browser.get(URL);
          waitForElement('ng-component-outlet-complete-example');
          expect(element.all(by.css('complete-component')).getText()).toEqual([
            'Complete: AhojSvet!'
          ]);
        });
  });
});
