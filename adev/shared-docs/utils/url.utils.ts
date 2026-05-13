/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {normalizePath} from './navigation.utils';

export function getRelativeUrl(
  absoluteUrl: string,
  result: 'relative' | 'pathname' | 'hash' = 'relative',
): string {
  const url = new URL(normalizePath(absoluteUrl));

  if (result === 'hash') {
    return url.hash?.substring(1) ?? '';
  }
  if (result === 'pathname') {
    return `${removeTrailingSlash(normalizePath(url.pathname))}`;
  }
  return `${removeTrailingSlash(normalizePath(url.pathname))}${url.hash ?? ''}`;
}

export const removeTrailingSlash = (url: string): string => {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
};
