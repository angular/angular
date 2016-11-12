/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser, by, element} from 'protractor';

describe('SVG', function() {

  const URL = 'all/playground/src/svg/index.html';

  afterEach(verifyNoBrowserErrors);
  beforeEach(() => { browser.get(URL); });

  it('should display SVG component contents', function() {
    const svgText = element.all(by.css('g text')).get(0);
    expect(svgText.getText()).toEqual('Hello');
  });

});
