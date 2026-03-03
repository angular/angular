/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const path = require('path');

module.exports = {
  baseDir: '../',
  glob: `../{packages,adev}/**/*.ts`,
  resolveModule: resolveModule,
  ignoreTypeOnlyChecks: true,
};

/**
 * Custom module resolver that maps specifiers starting with `@angular/` to the
 * local packages folder. This ensures that cross package/entry-point dependencies
 * can be detected.
 */
function resolveModule(specifier) {
  if (specifier.startsWith('@angular/')) {
    return path.join(__dirname, specifier.slice('@angular/'.length));
  }
  return null;
}
