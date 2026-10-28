/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {expect, test} from '@playwright/test';

test.describe('Playground', () => {
  test('should run an Angular application in the preview', async ({page}) => {
    await page.goto('/playground');

    const previewFrame = page.frameLocator('iframe.adev-embedded-editor-preview');
    await expect(previewFrame.locator('app-root')).toContainText('Hello world!', {
      timeout: 120_000,
    });
  });
});
