/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const {chmod, cp, mkdir, rm} = require('shelljs');
const {baseDir, bazelBin, bazelCmd, exec, scriptPath} = require('./package-builder');


module.exports = {
  buildDevInfraPackage
};

/**
 * Build the `zone.js` npm package into `dist/bin/packages/zone.js/npm_package/` and copy it to
 * `dist/zone.js-dist/` for other scripts/tests to use.
 *
 * NOTE: The `zone.js` package is not built as part of `package-builder`'s `buildTargetPackages()`
 *       nor is it copied into the same directory as the Angular packages (e.g.
 *       `dist/packages-dist/`) despite its source's being inside `packages/`, because it is not
 *       published to npm under the `@angular` scope (as happens for the rest of the packages).
 */
function buildDevInfraPackage() {
  console.info('##############################');
  console.info(`${scriptPath}:`);
  console.info('  Building @angular/dev-infra-private npm package');
  console.info('##############################');
  exec(`${bazelCmd} build //dev-infra:npm_package`);

  const buildOutputDir = `${bazelBin}/dev-infra/npm_package`;
  const distTargetDir = `${baseDir}/dist/packages-dist/dev-infra-private`;

  console.info(`# Copy artifacts to ${distTargetDir}`);
  mkdir('-p', distTargetDir);
  rm('-rf', distTargetDir);
  cp('-R', buildOutputDir, distTargetDir);
  chmod('-R', 'u+w', distTargetDir);

  console.info('');
}
