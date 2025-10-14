/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const API_PREFIX = 'api';
export function getLinkToModule(moduleName, symbol, subSymbol) {
  return `/${API_PREFIX}/${moduleName}/${symbol}${subSymbol ? `#${subSymbol}` : ''}`;
}
export const normalizePath = (path) => {
  if (path[0] === '/') {
    return path.substring(1);
  }
  return path;
};
//# sourceMappingURL=url-transforms.mjs.map
