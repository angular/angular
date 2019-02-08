/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fixmeIvy, modifiedInIvy} from '@angular/private/testing';
import {$, ExpectedConditions, browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../test-utils';

function waitForElement(selector: string) {
  const EC = ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

fixmeIvy('FW-1022: JitCompilerFactory creates incorrect compiler instance')
    .describe('ngComponentOutlet', () => {
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

        it('should render other module', () => {
          browser.get(URL);
          waitForElement('ng-component-outlet-other-module-example');
          expect(element.all(by.css('other-module-component')).getText()).toEqual([
            'Other Module Component!'
          ]);
        });
      });
    });
