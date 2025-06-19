/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {QueryFunctionName} from '@angular/compiler-cli';

/** Converts an initializer query API name to its decorator-equivalent. */
export function queryFunctionNameToDecorator(name: QueryFunctionName): string {
  if (name === 'viewChild') {
    return 'ViewChild';
  } else if (name === 'viewChildren') {
    return 'ViewChildren';
  } else if (name === 'contentChild') {
    return 'ContentChild';
  } else if (name === 'contentChildren') {
    return 'ContentChildren';
  }
  throw new Error(`Unexpected query function name: ${name}`);
}
