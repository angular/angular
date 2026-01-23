/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Definition of a test browser. */
export interface Browser {
  browserName: string;
  browserVersion?: string;
  platformName?: string;
  platformVersion?: string;
  deviceName?: string;
}

/**
 * Gets a unique id for the specified browser. This id can be shared
 * across the background service and launcher using IPC.
 */
export function getUniqueId(browser: Browser): string {
  let result = Object.keys(browser)
    .sort()
    .map((key) => `${key}=${browser[key as keyof Browser]}`);
  return result.join(':');
}
