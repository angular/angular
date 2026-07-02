/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

module.exports = {
  // TODO: Investigate if this can be removed once ng_module is migrated to ng_project
  resolveExtensions: ['.mjs', '.js'],
  format: 'esm',
  banner: {
    // Workaround for: https://github.com/evanw/esbuild/issues/946
    // TODO: Remove this workaround in the future once devmode is ESM as well.
    js: `
      import {createRequire as __cjsCompatRequire} from 'module';
      const require = __cjsCompatRequire(import.meta.url);
    `,
  },
};
