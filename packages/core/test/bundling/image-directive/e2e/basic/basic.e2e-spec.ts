/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';

import {verifyNoBrowserErrors} from '../util';

describe('NgOptimizedImage directive', () => {
  afterEach(verifyNoBrowserErrors);

  it('should render an image with an updated `src`', async () => {
    await browser.get('/e2e/basic');
    const imgs = element.all(by.css('img'));
    const src = await imgs.get(0).getAttribute('src');
    expect(/b\.png/.test(src)).toBe(true);
  });
});
