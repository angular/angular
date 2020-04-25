/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

/**
 * Resolves a given path through Bazel while respecting the specified parent directory.
 * Usually `require.resolve` could just be used for resolving runfiles relatively, but support
 * for this has been removed and absolute manifest paths or the runfile helpers are now needed
 * on Windows. This helper provides a resolution method that works the same on all platforms.
 */
export function resolveBazelPath(parent: string, relativePath: string) {
  if (process.env['RUNFILES_MANIFEST_ONLY'] !== '1') {
    return path.join(parent, relativePath);
  }
  // Imports the runfile helpers from the Bazel NodeJS rules. This should be ideally
  // a separate package with types. https://github.com/bazelbuild/rules_nodejs/issues/1793.
  // Note: We don't want to import this outside of this function as the runfile helpers are
  // quite large we don't want to load them for every import to `@angular/cdk/testing/private`.
  const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']!);
  const projectDirs = [
    // Workspace symlinked into `@npm//:node_modules/`.
    path.join(runfiles.resolve('npm/node_modules'), runfiles.workspace),
    // Workspace bazel-bin directory.
    runfiles.resolve(runfiles.workspace),
  ];

  for (const projectDir of projectDirs) {
    const relativeParent = path.relative(projectDir, parent);
    const workspacePath = path.join(relativeParent, relativePath).replace(/\\/g, '/');
    const result = runfiles.resolveWorkspaceRelative(workspacePath);
    if (result) {
      return result;
    }
  }

  throw Error(`Could not resolve path. Looked in: ${projectDirs.join(', ')}`);
}
