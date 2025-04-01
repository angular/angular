/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {normalizePath, removeTrailingSlash} from '../utils/index';

@Pipe({
  name: 'relativeLink',
})
export class RelativeLink implements PipeTransform {
  transform(absoluteUrl: string, result: 'relative' | 'pathname' | 'hash' = 'relative'): string {
    const url = new URL(normalizePath(absoluteUrl));

    if (result === 'hash') {
      return url.hash?.substring(1) ?? '';
    }
    if (result === 'pathname') {
      return `${removeTrailingSlash(normalizePath(url.pathname))}`;
    }
    return `${removeTrailingSlash(normalizePath(url.pathname))}${url.hash ?? ''}`;
  }
}
