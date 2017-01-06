/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser, by, element} from 'protractor';

describe('Zippy Component', function() {

  afterEach(verifyNoBrowserErrors);

  describe('zippy', function() {
    const URL = 'all/playground/src/zippy_component/index.html';

    beforeEach(function() { browser.get(URL); });

    it('should change the zippy title depending on it\'s state', function() {
      const zippyTitle = element(by.css('.zippy__title'));

      expect(zippyTitle.getText()).toEqual('▾ Details');
      zippyTitle.click();
      expect(zippyTitle.getText()).toEqual('▸ Details');
    });

    it('should have zippy content', function() {
      expect(element(by.css('.zippy__content')).getText()).toEqual('This is some content.');
    });

    it('should toggle when the zippy title is clicked', function() {
      element(by.css('.zippy__title')).click();
      expect(element(by.css('.zippy__content')).isDisplayed()).toEqual(false);
      element(by.css('.zippy__title')).click();
      expect(element(by.css('.zippy__content')).isDisplayed()).toEqual(true);
    });
  });
});
