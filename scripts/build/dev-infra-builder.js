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
  buildDevInfraPackage,
};

/**
 * Build the `@angular/dev-infra-private` npm package into `destDir`.
 *
 * @param {string} destDir Path to the output directory into which we copy the npm package.
 *     This path should either be absolute or relative to the project root.
 */
function buildDevInfraPackage(destDir) {
  console.info('##############################');
  console.info(`${scriptPath}:`);
  console.info('  Building @angular/dev-infra-private npm package');
  console.info('##############################');
  exec(`${bazelCmd} build //dev-infra:npm_package`);

  // Create the output directory.
  const absDestDir = resolve(baseDir, destDir);
  if (!test('-d', absDestDir)) {
    mkdir('-p', absDestDir);
  }

  const buildOutputDir = `${bazelBin}/dev-infra/npm_package`;
  const distTargetDir = `${absDestDir}/dev-infra-private`;

  console.info(`# Copy artifacts to ${distTargetDir}`);
  rm('-rf', distTargetDir);
  cp('-R', buildOutputDir, distTargetDir);
  chmod('-R', 'u+w', distTargetDir);

  console.info('');
}
