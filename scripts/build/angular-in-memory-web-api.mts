/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'path';

import {bazelCmd, exec} from './package-builder.mts';

/**
 * Build the `angular-in-memory-web-api` npm package and copies it into the release
 * distribution directory.
 *
 * NOTE: The `angular-in-memory-web-api` package is not built as part of `package-builder`'s
 *       `buildTargetPackages()` nor is it copied into the same directory as the Angular packages (e.g.
 *       `dist/packages-dist/`) despite its source's being inside `packages/`, because it is not
 *       published to npm under the `@angular` scope (as happens for the rest of the packages).
 *
 * @param {string} destDir Path to the output directory into which we copy the npm package.
 *     This path should either be absolute or relative to the project root.
 */
export function buildAngularInMemoryWebApiPackage(destDir: string): void {
  console.info('##############################');
  console.info('  Building angular-in-memory-web-api npm package');
  console.info('##############################');

  exec(`${bazelCmd} build //packages/misc/angular-in-memory-web-api:npm_package`, true);
  // Ensure the output directory is available.
  exec(`mkdir -p ${destDir}`);

  // TODO: Remove --ignore_all_rc_files flag once a repository can be loaded in bazelrc during info
  // commands again. See https://github.com/bazelbuild/bazel/issues/25145 for more context.
  const bazelBinPath = exec(`${bazelCmd} --ignore_all_rc_files info bazel-bin`, true);

  // Copy artifacts to `destDir`, so they can be easier persisted on CI and used by non-bazel
  // scripts/tests.
  const buildOutputDir = join(bazelBinPath, 'packages/misc/angular-in-memory-web-api/npm_package');
  const distTargetDir = join(destDir, 'angular-in-memory-web-api');

  console.info(`# Copy npm_package artifacts to ${distTargetDir}`);

  exec(`rm -rf ${distTargetDir}`);
  exec(`cp -R ${buildOutputDir} ${distTargetDir}`);
  exec(`chmod -R u+w ${distTargetDir}`);
}
