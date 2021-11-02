/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const {resolve} = require('path');
const {chmod, cp, mkdir, rm, test} = require('shelljs');
const {baseDir, bazelBin, bazelCmd, exec, scriptPath} = require('./package-builder');


module.exports = {
  buildAngularInMemoryWebApiPackage,
};

/**
 * Build the `angular-in-memory-web-api` npm package and copy it to `destDir` for other
 * scripts/tests to use.
 *
 * NOTE: The `angular-in-memory-web-api` package is not built as part of `package-builder`'s
 *       `buildTargetPackages()` nor is it copied into the same directory as the Angular packages
 *       (e.g. `dist/packages-dist/`) despite its source's being inside `packages/`, because it is
 *       not published to npm under the `@angular` scope (as happens for the rest of the packages).
 *
 * @param {string} destDir Path to the output directory into which we copy the npm package.
 *     This path should either be absolute or relative to the project root.
 */
function buildAngularInMemoryWebApiPackage(destDir) {
  console.info('##############################');
  console.info(`${scriptPath}:`);
  console.info('  Building angular-in-memory-web-api npm package');
  console.info('##############################');
  exec(`${bazelCmd} build //packages/misc/angular-in-memory-web-api:npm_package`);

  // Create the output directory.
  const absDestDir = resolve(baseDir, destDir);
  if (!test('-d', absDestDir)) {
    mkdir('-p', absDestDir);
  }

  const buildOutputDir = `${bazelBin}/packages/misc/angular-in-memory-web-api/npm_package`;
  const distTargetDir = `${absDestDir}/angular-in-memory-web-api`;

  console.info(`# Copy artifacts to ${distTargetDir}`);
  rm('-rf', distTargetDir);
  cp('-R', buildOutputDir, distTargetDir);
  chmod('-R', 'u+w', distTargetDir);

  console.info('');
}
