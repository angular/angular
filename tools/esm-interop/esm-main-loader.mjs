/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {extname} from 'path';
import {fileURLToPath} from 'url';

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

export async function load(url, context, defaultLoad) {
  // Using `--loader` causes non-ESM extension-less files like
  // for `typescript/bin/tsc` to be considered as ESM. This is a bug
  // via: https://github.com/nodejs/node/issues/33226.
  // Workaround is to load such extension-less files as CommonJS. Similar
  // to how they are loaded without `--loader` being specified.
  if (url.startsWith('file://') && extname(fileURLToPath(url)) === '') {
    context.format = 'commonjs';
  }

  return defaultLoad(url, context, defaultLoad);
}
