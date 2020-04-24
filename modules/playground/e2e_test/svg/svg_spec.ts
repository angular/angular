/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../dev-infra/benchmark/driver-utilities';

describe('SVG', function() {
  const URL = '/';

  afterEach(verifyNoBrowserErrors);
  beforeEach(() => {
    browser.get(URL);
  });

  it('should display SVG component contents', function() {
    const svgText = element.all(by.css('g text')).get(0);
    expect(svgText.getText()).toEqual('Hello');
  });
});
