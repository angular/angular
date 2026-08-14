/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {collectBrowserLogs, createWebDriver, waitForBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive (image-distortion)', () => {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());

    // Prime the memory cache with `a.png` by visiting the passing component first.
    // Chromium's native lazy loading defers `display: none` images indefinitely
    // unless they are already in the memory cache.
    await driver.get(`${baseUrl}/e2e/image-distortion-passing`);
    await new Promise((r) => setTimeout(r, 1000));
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should not warn if there is no image distortion', async () => {
    await driver.get(`${baseUrl}/e2e/image-distortion-passing`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const logs = await collectBrowserLogs(driver, webdriver.logging.Level.WARNING);
    expect(logs.length).toEqual(0);
  });

  it('should warn if there is image distortion', async () => {
    await driver.get(`${baseUrl}/e2e/image-distortion-failing`);
    const logs = await waitForBrowserLogs(driver, webdriver.logging.Level.WARNING, 8, 15000, (l) =>
      l.message.includes('NG02952'),
    );

    expect(logs.length).toEqual(8);

    // Image loading order is not guaranteed, so all logs, rather than single entry
    // needs to be checked in order to test whether a given error message is present.
    const expectErrorMessageInLogs = (logs: webdriver.logging.Entry[], message: string) => {
      expect(
        logs.some((log) => {
          return log.message.includes(message);
        }),
      ).toBeTruthy();
    };

    // Images with incorrect width/height attributes
    expectErrorMessageInLogs(
      logs,
      'The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
        'with the `ngSrc=\\"/e2e/b.png\\"`) has detected that ' +
        'the aspect ratio of the image does not match the aspect ratio indicated by the width and height attributes. ' +
        '\\nIntrinsic image size: 250w x 250h (aspect-ratio: 1). ' +
        '\\nSupplied width and height attributes: 26w x 30h (aspect-ratio: 0.87). ' +
        '\\nTo fix this, update the width and height attributes.',
    );

    expectErrorMessageInLogs(
      logs,
      'The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
        'with the `ngSrc=\\"/e2e/b.png\\"`) has detected that ' +
        'the aspect ratio of the image does not match the aspect ratio indicated by the width and height attributes. ' +
        '\\nIntrinsic image size: 250w x 250h (aspect-ratio: 1). ' +
        '\\nSupplied width and height attributes: 24w x 240h (aspect-ratio: 0.10). ' +
        '\\nTo fix this, update the width and height attributes.',
    );

    expectErrorMessageInLogs(
      logs,
      'The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
        'with the `ngSrc=\\"/e2e/a.png\\"`) has detected that ' +
        'the aspect ratio of the image does not match the aspect ratio indicated by the width and height attributes. ' +
        '\\nIntrinsic image size: 250w x 250h (aspect-ratio: 1). ' +
        '\\nSupplied width and height attributes: 222w x 25h (aspect-ratio: 8.88). ' +
        '\\nTo fix this, update the width and height attributes.',
    );

    // Images with incorrect styling
    expectErrorMessageInLogs(
      logs,
      'The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
        'with the `ngSrc=\\"/e2e/b.png\\"`) has detected that ' +
        "the aspect ratio of the rendered image does not match the image's intrinsic aspect ratio. " +
        '\\nIntrinsic image size: 250w x 250h (aspect-ratio: 1). ' +
        '\\nRendered image size: 250w x 30h (aspect-ratio: 8.33). ' +
        '\\nThis issue can occur if \\"width\\" and \\"height\\" attributes are added to an image ' +
        'without updating the corresponding image styling. To fix this, adjust image styling. In most cases, ' +
        'adding \\"height: auto\\" or \\"width: auto\\" to the image styling will fix this issue.',
    );

    expectErrorMessageInLogs(
      logs,
      'The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
        'with the `ngSrc=\\"/e2e/b.png\\"`) has detected that ' +
        "the aspect ratio of the rendered image does not match the image's intrinsic aspect ratio. " +
        '\\nIntrinsic image size: 250w x 250h (aspect-ratio: 1). ' +
        '\\nRendered image size: 30w x 250h (aspect-ratio: 0.12). ' +
        '\\nThis issue can occur if \\"width\\" and \\"height\\" attributes are added to an image ' +
        'without updating the corresponding image styling. To fix this, adjust image styling. In most cases, ' +
        'adding \\"height: auto\\" or \\"width: auto\\" to the image styling will fix this issue.',
    );

    // Padding is used on <img>
    expectErrorMessageInLogs(
      logs,
      'The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
        'with the `ngSrc=\\"/e2e/logo-500w.jpg\\"`) has detected that ' +
        "the aspect ratio of the rendered image does not match the image's intrinsic aspect ratio. " +
        '\\nIntrinsic image size: 500w x 500h (aspect-ratio: 1). ' +
        '\\nRendered image size: 100w x 500h (aspect-ratio: 0.20). ' +
        '\\nThis issue can occur if \\"width\\" and \\"height\\" attributes are added to an image ' +
        'without updating the corresponding image styling. To fix this, adjust image styling. In most cases, ' +
        'adding \\"height: auto\\" or \\"width: auto\\" to the image styling will fix this issue.',
    );
    expectErrorMessageInLogs(
      logs,
      'The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
        'with the `ngSrc=\\"/e2e/logo-500w.jpg\\"`) has detected that ' +
        "the aspect ratio of the rendered image does not match the image's intrinsic aspect ratio. " +
        '\\nIntrinsic image size: 500w x 500h (aspect-ratio: 1). ' +
        '\\nRendered image size: 200w x 400h (aspect-ratio: 0.50). ' +
        '\\nThis issue can occur if \\"width\\" and \\"height\\" attributes are added to an image ' +
        'without updating the corresponding image styling. To fix this, adjust image styling. In most cases, ' +
        'adding \\"height: auto\\" or \\"width: auto\\" to the image styling will fix this issue.',
    );

    // Image with incorrect width/height attributes AND incorrect styling
    // This only generate only one error to ensure that users first fix the width and height
    // attributes.
    expectErrorMessageInLogs(
      logs,
      'The NgOptimizedImage directive (activated on an \\u003Cimg> element ' +
        'with the `ngSrc=\\"/e2e/b.png\\"`) has detected that ' +
        'the aspect ratio of the image does not match the aspect ratio indicated by the width and height attributes. ' +
        '\\nIntrinsic image size: 250w x 250h (aspect-ratio: 1). ' +
        '\\nSupplied width and height attributes: 150w x 250h (aspect-ratio: 0.60). ' +
        '\\nTo fix this, update the width and height attributes.',
    );
  });
});
