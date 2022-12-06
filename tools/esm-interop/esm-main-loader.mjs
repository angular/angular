/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as extensionLoader from './esm-extension-loader.mjs';
import * as nodeModuleLoader from './esm-node-module-loader.mjs';

const loaders = [extensionLoader, nodeModuleLoader];

export async function resolve(initialSpecifier, initialCtx, defaultResolve) {
  let nextFn = (i) => (s, c) => {
    if (i === loaders.length) {
      return defaultResolve(s, c, defaultResolve);
    }
    return loaders[i].resolve(s, c, nextFn(i + 1));
  };

  return nextFn(0)(initialSpecifier, initialCtx);
}
