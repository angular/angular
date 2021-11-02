/**
 * Collection of common logic for dealing with Bazel runfiles within
 * integration tests.
 */

import path from 'path';
import fs from 'fs';

/**
 * Gets all built Angular NPM package artifacts by querying the Bazel runfiles.
 * In case there is a runfiles manifest (e.g. on Windows), the packages are resolved
 * through the manifest because the runfiles are not symlinked and cannot be searched
 * within the real filesystem.
 * TODO: Simplify if Bazel on Windows uses runfile symlinking.
 */
export function getNpmPackagesFromRunfiles() {
  // Path to the Bazel runfiles manifest if present. This file is present if runfiles are
  // not symlinked into the runfiles directory.
  const runfilesManifestPath = process.env.RUNFILES_MANIFEST_FILE;
  const workspacePath = 'angular_material/src';
  if (!runfilesManifestPath) {
    const packageRunfilesDir = path.join(process.env.RUNFILES, workspacePath);
    return fs
      .readdirSync(packageRunfilesDir)
      .map(name => ({name, pkgPath: path.join(packageRunfilesDir, name, 'npm_package/')}))
      .filter(({pkgPath}) => fs.existsSync(pkgPath));
  }
  const workspaceManifestPathRegex = new RegExp(`^${workspacePath}/[\\w-]+/npm_package$`);
  return fs
    .readFileSync(runfilesManifestPath, 'utf8')
    .split('\n')
    .map(mapping => mapping.split(' '))
    .filter(([runfilePath]) => runfilePath.match(workspaceManifestPathRegex))
    .map(([runfilePath, realPath]) => ({
      name: path.relative(workspacePath, runfilePath).split(path.sep)[0],
      pkgPath: realPath,
    }));
}
