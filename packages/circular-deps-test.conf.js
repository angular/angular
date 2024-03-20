/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');

module.exports = {
  baseDir : '../',
  goldenFile : '../goldens/circular-deps/packages.json',
  glob : `./**/*.ts`,
  // Command that will be displayed if the golden needs to be updated.
  approveCommand : 'yarn ts-circular-deps:approve',
  resolveModule : resolveModule,
  ignoreTypeOnlyChecks : true,
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
