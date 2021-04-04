/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const shx = require('shelljs');

/** Manifest path that refers to the Bazel package that contains all test sources. */
const baseManifestPath = 'angular/packages/compiler-cli/integrationtest';

/**
 * Temporary directory which will be used to build and run the integration tests. Note that
 * this environment variable is automatically set by Bazel for such test actions.
 */
const tmpDir = process.env.TEST_TMPDIR;

/** Fine grained node modules which are required in order to run the integration test. */
const requiredNodeModules = {
  '@angular/animations': resolveNpmTreeArtifact('angular/packages/animations/npm_package'),
  '@angular/common': resolveNpmTreeArtifact('angular/packages/common/npm_package'),
  '@angular/compiler': resolveNpmTreeArtifact('angular/packages/compiler/npm_package'),
  '@angular/compiler-cli': resolveNpmTreeArtifact('angular/packages/compiler-cli/npm_package'),
  '@angular/core': resolveNpmTreeArtifact('angular/packages/core/npm_package'),
  '@angular/forms': resolveNpmTreeArtifact('angular/packages/forms/npm_package'),
  '@angular/platform-browser':
      resolveNpmTreeArtifact('angular/packages/platform-browser/npm_package'),
  '@angular/platform-browser-dynamic':
      resolveNpmTreeArtifact('angular/packages/platform-browser-dynamic/npm_package'),
  '@angular/platform-server':
      resolveNpmTreeArtifact('angular/packages/platform-server/npm_package'),
  '@angular/router': resolveNpmTreeArtifact('angular/packages/router/npm_package'),
  // Note, @bazel/typescript does not appear here because it's not listed as a dependency of
  // @angular/compiler-cli
  '@types/jasmine': resolveNpmTreeArtifact('npm/node_modules/@types/jasmine'),
  '@types/node': resolveNpmTreeArtifact('npm/node_modules/@types/node'),

  // Transitive dependencies which need to be specified because the Angular NPM packages
  // depend on these without the Angular NPM packages being part of the Bazel managed deps.
  // This means that transitive dependencies need to be manually declared as required.
  'tslib': resolveNpmTreeArtifact('npm/node_modules/tslib'),
  'domino': resolveNpmTreeArtifact('npm/node_modules/domino'),
  'xhr2': resolveNpmTreeArtifact('npm/node_modules/xhr2'),

  // Fine grained dependencies which are used by the integration test Angular modules, and
  // need to be symlinked so that they can be resolved by NodeJS or NGC.
  'buffer-from': resolveNpmTreeArtifact('npm/node_modules/buffer-from'),
  'reflect-metadata': resolveNpmTreeArtifact('npm/node_modules/reflect-metadata'),
  'rxjs': resolveNpmTreeArtifact('npm/node_modules/rxjs'),
  'source-map': resolveNpmTreeArtifact('npm/node_modules/source-map'),
  'source-map-support': resolveNpmTreeArtifact('npm/node_modules/source-map-support'),
  'typescript': resolveNpmTreeArtifact('npm/node_modules/typescript'),
  'zone.js': resolveNpmTreeArtifact('angular/packages/zone.js/npm_package'),
};

/** Sets up the temporary test directory and returns the path to the directory. */
exports.setupTestDirectory = function() {
  copySourceFilesToTempDir();
  symlinkNodeModules();
  return tmpDir;
};

/**
 * Runs a given binary with the specified command line arguments. The working directory for
 * the spawned process will be the temporary directory.
 */
exports.runCommand = function runCommand(binary, args = []) {
  const ngcProcess = child_process.spawnSync(binary, args, {
    stdio: 'inherit',
    cwd: tmpDir,
    env: {
      ...process.env,
      // We need to set the "NODE_PATH" here because the built Angular NPM packages are symlinks
      // which NodeJS resolves into the output location. This is problematic because the output
      // location does not have the required dependencies of these NPM packages installed. This
      // could be fixed by setting the NodeJS "--preserve-symlinks" option, but this would mean
      // that transitive dependencies of fine-grained dependencies cannot be resolved either.
      NODE_PATH: path.join(tmpDir, 'node_modules/')
    }
  });

  if (ngcProcess.status !== 0) {
    console.error(`Command ${binary} failed with arguments: "${args.join(' ')}". See error above.`);
    process.exit(1);
  }
};

/**
 * Symlinks the specified node modules within the temporary directory. This is necessary because
 * this test is an integration test and we don't want to rely on any path-mapped module resolution.
 * Additionally, NGC expects types and imported packages to be within the project's root dir.
 */
function symlinkNodeModules() {
  Object.keys(requiredNodeModules).forEach(importName => {
    const outputPath = path.join(tmpDir, 'node_modules', importName);
    const moduleDir = requiredNodeModules[importName];
    shx.mkdir('-p', path.dirname(outputPath));
    fs.symlinkSync(moduleDir, outputPath, 'junction');
  });
}

/**
 * Copies all source files for the integration test to a temporary directory. This
 * is necessary because runfiles resolve on Windows to the original source location,
 * and we don't want to pollute the workspace sources. This breaks hermeticity.
 */
function copySourceFilesToTempDir() {
  getSourceFilesFromRunfiles().forEach(({realPath, relativeFilePath}) => {
    const tmpFilePath = path.join(tmpDir, relativeFilePath);

    shx.mkdir('-p', path.dirname(tmpFilePath));
    shx.cp(realPath, tmpFilePath);
  });
}

/**
 * Gets all source files for the integration test by querying the Bazel runfiles.
 * In case there is a runfiles manifest (e.g. on Windows), the source files are resolved
 * through the manifest because on these platforms the runfiles are not symlinked and
 * cannot be searched within the real filesystem.
 */
function getSourceFilesFromRunfiles() {
  // Path to the Bazel runfiles manifest if present. This file is present if runfiles are
  // not symlinked into the runfiles directory.
  const runfilesManifestPath = process.env.RUNFILES_MANIFEST_FILE;

  if (!runfilesManifestPath) {
    const packageRunfilesDir = path.join(process.env.RUNFILES, baseManifestPath);
    return findFilesWithinDirectory(packageRunfilesDir).map(filePath => ({
                                                              realPath: filePath,
                                                              relativeFilePath: path.relative(
                                                                  packageRunfilesDir, filePath)
                                                            }));
  }

  return fs.readFileSync(runfilesManifestPath, 'utf8')
      .split('\n')
      .map(mapping => mapping.split(' '))
      .filter(([runfilePath]) => runfilePath.startsWith(baseManifestPath))
      .map(
          ([runfilePath, realPath]) =>
              ({realPath, relativeFilePath: path.relative(baseManifestPath, runfilePath)}));
}

/**
 * Resolves a NPM package from the Bazel runfiles. We need to resolve the Bazel tree
 * artifacts using a "resolve file" because the NodeJS module resolution does not allow
 * resolving to directory paths.
 */
function resolveNpmTreeArtifact(manifestPath, resolveFile = 'package.json') {
  return path.dirname(require.resolve(path.posix.join(manifestPath, resolveFile)));
}

/** Finds all files within a specified directory. */
function findFilesWithinDirectory(directoryPath) {
  return shx.find(directoryPath).filter(filePath => !fs.lstatSync(filePath).isDirectory());
}
