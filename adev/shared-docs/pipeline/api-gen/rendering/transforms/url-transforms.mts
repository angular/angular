/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const API_PREFIX = 'api';
export const MODULE_NAME_PREFIX = '@angular/';

export function getLinkToModule(moduleName: string, symbol: string, subSymbol?: string) {
  return `/${API_PREFIX}/${moduleName}/${symbol}${subSymbol ? `#${subSymbol}` : ''}`;
}

export const normalizePath = (path: string): string => {
  if (path[0] === '/') {
    return path.substring(1);
  }
  return path;
};
