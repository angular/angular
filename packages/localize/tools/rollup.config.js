/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const preserveShebang = require('rollup-plugin-preserve-shebang');
const sourcemaps = require('rollup-plugin-sourcemaps');
const {builtinModules} = require('module');

module.exports = {
  // The Angular compiler and CLI should remain external as the browser entry-points like
  // `@angular/localize` or `@angular/localize/init` do not use bundled versions either,
  // We would not want deviate here, and use different versions of framework packages.
  // All other dependencies cannot be bundled reliably and remain external dependencies.
  external: builtinModules.concat([
    '@angular/localize', '@angular/compiler', '@angular/compiler-cli/private/localize',
    '@babel/core', '@babel/types', 'yargs', 'glob'
  ]),
  onwarn: customWarningHandler,
  plugins: [sourcemaps(), preserveShebang()]
};

/** Custom warning handler for Rollup. */
function customWarningHandler(warning, defaultHandler) {
  // If rollup is unable to resolve an import, we want to throw an error
  // instead of silently treating the import as external dependency.
  // https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
  if (warning.code === 'UNRESOLVED_IMPORT') {
    throw Error(`Unresolved import: ${warning.message}`);
  }

  defaultHandler(warning);
}
