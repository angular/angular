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
 * Build the `angular-in-memory-web-api` npm package and copy it to `dist/packages-dist/misc`.
 */
function buildAngularInMemoryWebAPIPackage() {
  console.info('##############################');
  console.info(`${scriptPath}:`);
  console.info('  Building angular-in-memory-web-api npm package');
  console.info('##############################');
  exec(`${bazelCmd} build //packages/misc/angular-in-memory-web-api:npm_package`);

  const buildOutputDir = `${bazelBin}/packages/misc/angular-in-memory-web-api/npm_package`;
  const distTargetDir = `${baseDir}/dist/packages-dist/misc/angular-in-memory-web-api`;

  console.info(`# Copy artifacts to ${distTargetDir}`);
  mkdir('-p', distTargetDir);
  rm('-rf', distTargetDir);
  cp('-R', buildOutputDir, distTargetDir);
  chmod('-R', 'u+w', distTargetDir);

  console.info('');
}

module.exports = {buildAngularInMemoryWebAPIPackage};
