#!/usr/bin/env node
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
buildTargetPackages('dist/packages-dist', 'legacy', 'Production');

// Build the `zone.js` npm package (into `dist/bin/packages/zone.js/npm_package/`), because it might
// be needed by other scripts/tests.
//
// NOTE: The `zone.js` package is not built as part of `buildTargetPackages()` above, nor is it
//       copied into the `dist/packages-dist/` directory (despite its source's being inside
//       `packages/`), because it is not published to npm under the `@angular` scope (as happens for
//       the rest of the packages).
console.log('');
console.log('##############################');
console.log(`${scriptPath}:`);
console.log('  Building zone.js npm package');
console.log('##############################');
exec(`${bazelCmd} build //packages/zone.js:npm_package`);

// Copy artifacts to `dist/zone.js-dist/`, so they can be easier persisted on CI.
const buildOutputDir = `${bazelBin}/packages/zone.js/npm_package`;
const distTargetDir = `${baseDir}/dist/zone.js-dist/zone.js`;

console.log(`# Copy artifacts to ${distTargetDir}`);
mkdir('-p', distTargetDir);
rm('-rf', distTargetDir);
cp('-R', buildOutputDir, distTargetDir);
chmod('-R', 'u+w', distTargetDir);
