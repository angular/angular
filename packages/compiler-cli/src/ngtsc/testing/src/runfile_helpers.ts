/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';

/**
 * Gets all built Angular NPM package artifacts by querying the Bazel runfiles.
 * In case there is a runfiles manifest (e.g. on Windows), the packages are resolved
 * through the manifest because the runfiles are not symlinked and cannot be searched
 * within the real filesystem.
 */
export function getAngularPackagesFromRunfiles() {
  // Path to the Bazel runfiles manifest if present. This file is present if runfiles are
  // not symlinked into the runfiles directory.
  const runfilesManifestPath = process.env['RUNFILES_MANIFEST_FILE'];

  if (!runfilesManifestPath) {
    const packageRunfilesDir = path.join(process.env['RUNFILES']!, '_main/packages');

    return fs
      .readdirSync(packageRunfilesDir)
      .map((name) => ({name, pkgPath: path.join(packageRunfilesDir, name, 'npm_package/')}))
      .filter(({pkgPath}) => fs.existsSync(pkgPath));
  }

  return fs
    .readFileSync(runfilesManifestPath, 'utf8')
    .split('\n')
    .map((mapping) => mapping.split(' '))
    .filter(([runfilePath]) => runfilePath.match(/^_main\/packages\/[\w-]+\/npm_package$/))
    .map(([runfilePath, realPath]) => ({
      name: path.relative('_main/packages', runfilePath).split(path.sep)[0],
      pkgPath: realPath,
    }));
}

/** Resolves a file or directory from the Bazel runfiles. */
export function resolveFromRunfiles(manifestPath: string) {
  return path.resolve(process.env['RUNFILES']!, manifestPath);
}
