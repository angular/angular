/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';

const PACKAGE_PATH =
    runfiles.resolve(`npm_ts_versions/node_modules/${process.env.TS_VERSION_PACKAGE}`);

/**
 * NodeJS hook that ensures TypeScript is imported from the configured
 * TS version package. This allows us to conveniently test against multiple
 * TS versions.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'typescript') {
    return nextResolve(`${PACKAGE_PATH}/lib/typescript.js`, context);
  }
  return nextResolve(specifier, context);
}
