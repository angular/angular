/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {defineConfig, devices} from '@playwright/test';

const PORT = 4201;
const BASE_URL = process.env['PLAYWRIGHT_BASE_URL'] ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? 'github' : [['html', {open: 'never'}], ['list']],
  timeout: 180_000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env['CHROME_BIN']
          ? {
              launchOptions: {
                executablePath: process.env['CHROME_BIN'],
                args: ['--no-sandbox'],
              },
            }
          : {}),
      },
    },
  ],
  webServer: process.env['PLAYWRIGHT_BASE_URL']
    ? undefined
    : {
        command: 'pnpm -w bazel run //adev:build.serve',
        url: BASE_URL,
        reuseExistingServer: !process.env['CI'],
        timeout: 300_000,
      },
});
