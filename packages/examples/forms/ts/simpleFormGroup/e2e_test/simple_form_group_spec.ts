/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element, ElementFinder} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../test-utils';

describe('formControlName example', () => {
  afterEach(verifyNoBrowserErrors);

  describe('index view', () => {
    let firstInput: ElementFinder;
    let lastInput: ElementFinder;

    beforeEach(() => {
      browser.get('/simpleFormGroup');
      firstInput = element(by.css('[formControlName="first"]'));
      lastInput = element(by.css('[formControlName="last"]'));
    });

    it('should populate the form control values in the DOM', () => {
      expect(firstInput.getAttribute('value')).toEqual('Nancy');
      expect(lastInput.getAttribute('value')).toEqual('Drew');
    });

    it('should show the error when the form is invalid', () => {
      firstInput.click();
      firstInput.clear();
      firstInput.sendKeys('a');

      expect(element(by.css('div')).getText()).toEqual('Name is too short.');
    });

    it('should set the value programmatically', () => {
      element(by.css('button:not([type="submit"])')).click();
      expect(firstInput.getAttribute('value')).toEqual('Carson');
      expect(lastInput.getAttribute('value')).toEqual('Drew');
    });
  });
});
