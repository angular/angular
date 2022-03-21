/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');

module.exports = {
  baseDir: '../',
  goldenFile: '../goldens/ts-circular-deps.json',
  glob: `./**/*.ts`,
  // Command that will be displayed if the golden needs to be updated.
  approveCommand: 'yarn ts-circular-deps:approve',
  resolveModule,
};

/**
 * Custom module resolver that maps specifiers starting with `@angular/` to the
 * local packages folder. This ensures that imports using the module name can be
 * resolved. Cross entry-point/package circular dependencies are already be detected
 * by Bazel, but in rare cases, the module name is used for imports within entry-points.
 */
function resolveModule(specifier) {
  if (specifier.startsWith('@angular/')) {
    return path.join(__dirname, specifier.slice('@angular/'.length));
  }
  return null;
}
