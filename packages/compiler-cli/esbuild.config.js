/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = {
  resolveExtensions : ['.mjs', '.js'],
  // Note: `@bazel/esbuild` has a bug and does not pass-through the format from Starlark.
  format : 'esm',
  banner : {
    // Workaround for: https://github.com/evanw/esbuild/issues/946
    js : `
      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    `,
  },
};
