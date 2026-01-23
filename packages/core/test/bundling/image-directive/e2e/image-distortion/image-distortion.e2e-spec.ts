/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser} from 'protractor';
import {logging} from 'selenium-webdriver';

import {collectBrowserLogs} from '../browser-logs-util';

describe('NgOptimizedImage directive', () => {
  it('should not warn if there is no image distortion', async () => {
    await browser.get('/e2e/image-distortion-passing');
    const logs = await collectBrowserLogs(logging.Level.WARNING);
    expect(logs.length).toEqual(0);
  });

  it('should warn if there is image distortion', async () => {
    await browser.get('/e2e/image-distortion-failing');
    const logs = await collectBrowserLogs(logging.Level.WARNING);

    expect(logs.length).toEqual(7);
    // Image loading order is not guaranteed, so all logs, rather than single entry
    // needs to be checked in order to test whether a given error message is present.
    const expectErrorMessageInLogs = (logs: logging.Entry[], message: string) => {
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
