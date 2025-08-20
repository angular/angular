/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'path';
import sh from 'shelljs';

import {projectDir, bazelCmd, exec} from './package-builder.mjs';

/**
 * Build the `zone.js` npm package into `dist/bin/packages/zone.js/npm_package/` and copy it to
 * `destDir` for other scripts/tests to use.
 *
 * NOTE: The `zone.js` package is not built as part of `package-builder`'s `buildTargetPackages()`
 *       nor is it copied into the same directory as the Angular packages (e.g.
 *       `dist/packages-dist/`) despite its source's being inside `packages/`, because it is not
 *       published to npm under the `@angular` scope (as happens for the rest of the packages).
 *
 * @param {string} destDir Path to the output directory into which we copy the npm package.
 *     This path should either be absolute or relative to the project root.
 */
export function buildZoneJsPackage(destDir: string): void {
  console.info('##############################');
  console.info('  Building zone.js npm package');
  console.info('##############################');

  exec(`${bazelCmd} build //packages/zone.js:npm_package`);

  // Create the output directory.
  if (!sh.test('-d', destDir)) {
    sh.mkdir('-p', destDir);
  }

  const bazelBinPath = exec(`${bazelCmd} info bazel-bin`, true);

  // Copy artifacts to `destDir`, so they can be easier persisted on CI and used by non-bazel
  // scripts/tests.
  const buildOutputDir = join(bazelBinPath, 'packages/zone.js/npm_package');
  const distTargetDir = join(destDir, 'zone.js');

  console.info(`# Copy npm_package artifacts to ${distTargetDir}`);

  sh.rm('-rf', distTargetDir);
  sh.cp('-R', buildOutputDir, distTargetDir);
  sh.chmod('-R', 'u+w', distTargetDir);
}
