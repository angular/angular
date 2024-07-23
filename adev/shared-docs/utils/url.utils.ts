/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const removeTrailingSlash = (url: string): string => {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
};
