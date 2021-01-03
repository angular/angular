/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const {chmod, cp, mkdir, rm} = require('shelljs');
const {baseDir, bazelBin, bazelCmd, exec, scriptPath} = require('./package-builder');

/**
 * Build the `@angular/dev-infra-private` npm package and copies it to `dist/packages-dist`.
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

module.exports = {buildDevInfraPackage};
