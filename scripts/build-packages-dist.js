#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const {chmod, cp, mkdir, rm} = require('shelljs');
const {
  baseDir,
  bazelBin,
  bazelCmd,
  buildTargetPackages,
  exec,
  scriptPath,
} = require('./package-builder');


// Build the legacy (view engine) npm packages into `dist/packages-dist/`.
buildTargetPackages('dist/packages-dist', false, 'Production');

// Build the `zone.js` npm package (into `dist/bin/packages/zone.js/npm_package/`), because it might
// be needed by other scripts/tests.
//
// NOTE: The `zone.js` package is not built as part of `buildTargetPackages()` above, nor is it
//       copied into the `dist/packages-dist/` directory (despite its source's being inside
//       `packages/`), because it is not published to npm under the `@angular` scope (as happens for
//       the rest of the packages).
console.info('');
console.info('##############################');
console.info(`${scriptPath}:`);
console.info('  Building zone.js npm package');
console.info('##############################');
exec(`${bazelCmd} build //packages/zone.js:npm_package`);

// Copy artifacts to `dist/zone.js-dist/`, so they can be easier persisted on CI.
const buildOutputDir = `${bazelBin}/packages/zone.js/npm_package`;
const distTargetDir = `${baseDir}/dist/zone.js-dist/zone.js`;

console.info(`# Copy artifacts to ${distTargetDir}`);
mkdir('-p', distTargetDir);
rm('-rf', distTargetDir);
cp('-R', buildOutputDir, distTargetDir);
chmod('-R', 'u+w', distTargetDir);
