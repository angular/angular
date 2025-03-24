/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element} from 'protractor';
import {logging} from 'selenium-webdriver';

import {collectBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive', () => {
  it('should render an image with an updated `src`', async () => {
    await browser.get('/e2e/basic');
    const imgs = element.all(by.css('img'));
    const src = await imgs.get(0).getAttribute('src');
    expect(/angular\.svg/.test(src)).toBe(true);

    // Since there are no preconnect tags on a page,
    // we expect a log in a console that mentions that.
    const logs = await collectBrowserLogs(logging.Level.WARNING);
    expect(logs.length).toEqual(1);

    // Verify that the error code and a raw image src are present.
    expect(logs[0].message).toMatch(/NG02956.*?a\.png/);
  });
});
