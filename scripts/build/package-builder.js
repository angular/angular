/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

// Build the dist/packages-dist directory in the same fashion as the legacy
// /build.sh script, by building the npm packages with Bazel and copying files.
// This is needed for scripts and tests which are not updated to the Bazel output
// layout (which always matches the input layout).
// Do not add new dependencies on this script, instead adapt scripts to use the
// new layout, and write new tests as Bazel targets.
//
// Ideally integration tests should run under bazel, and just consume the npm
// packages via `deps`. Until that works, we manually build the npm packages and then
// copy the results to the appropriate `dist` location.

// NOTE: this script may be run from any directory. The actions should be written to be independent
// of the current working directory. For example, use absolute paths wherever possible, and pass a
// working directory to tools like `yarn`.

const {execSync} = require('child_process');
const {resolve, relative} = require('path');
const {chmod, cp, mkdir, rm, set, test} = require('shelljs');

set('-e');


/** @type {string} The absolute path to the project root directory. */
const baseDir = resolve(`${__dirname}/../..`);

/** @type {string} The command to use for running bazel. */
const bazelCmd = `yarn --cwd "${baseDir}" --silent bazel`;

/** @type {string} The absolute path to the bazel-bin directory. */
const bazelBin = exec(`${bazelCmd} info bazel-bin`, true);

/**
 * @type {string}
 * The relative path to the entry script (i.e. the one loaded when the Node.js process launched).
 * It is relative to `baseDir`.
 */
const scriptPath = relative(baseDir, require.main.filename);

module.exports = {
  baseDir,
  bazelBin,
  bazelCmd,
  buildTargetPackages,
  exec,
  scriptPath,
};

/**
 * Build the Angular packages.
 *
 * @param {string} destDir Path to the output directory into which we copy the npm packages.
 * This path should either be absolute or relative to the project root.
 * @param {boolean} enableIvy True, if Ivy should be used.
 * @param {string} description Human-readable description of the build.
 * @param {boolean?} isRelease True, if the build should be stamped for a release.
 * @returns {Array<{name: string, outputPath: string}} A list of packages built.
 */
function buildTargetPackages(destDir, enableIvy, description, isRelease = false) {
  console.info('##################################');
  console.info(`${scriptPath}:`);
  console.info('  Building @angular/* npm packages');
  console.info(`  Mode: ${description}`);
  console.info('##################################');

  /** The list of packages which were built. */
  const builtPackages = [];
  // List of targets to build, e.g. core, common, compiler, etc. Note that we want to also remove
  // all carriage return (`\r`) characters form the query output, because otherwise the carriage
  // return is part of the bazel target name and bazel will complain.
  const getTargetsCmd = `${
      bazelCmd} query --output=label "attr('tags', '\\[.*release-with-framework.*\\]', //packages/...) intersect kind('ng_package|pkg_npm', //packages/...)"`;
  const targets = exec(getTargetsCmd, true).split(/\r?\n/);

  // If we are in release mode, run `bazel clean` to ensure the execroot and action cache
  // are not populated. This is necessary because targets using `npm_package` rely on
  // workspace status variables for the package version. Such NPM package targets are not
  // rebuilt if only the workspace status variables change. This could result in accidental
  // re-use of previously built package output with a different `version` in the `package.json`.
  if (isRelease) {
    console.info('Building in release mode. Resetting the Bazel execroot and action cache..');
    exec(`${bazelCmd} clean`);
  }

  // Use either `--config=snapshot` or `--config=release` so that builds are created with the
  // correct embedded version info.
  exec(`${bazelCmd} build --config=${isRelease ? 'release' : 'snapshot'} --config=${
      enableIvy ? 'ivy' : 'view-engine'} ${targets.join(' ')}`);

  // Create the output directory.
  const absDestDir = resolve(baseDir, destDir);
  if (!test('-d', absDestDir)) {
    mkdir('-p', absDestDir);
  }

  targets.forEach(target => {
    const pkg = target.replace(/\/\/packages\/(.*):npm_package/, '$1');

    // Skip any that don't have an "npm_package" target.
    const srcDir = `${bazelBin}/packages/${pkg}/npm_package`;
    const destDir = `${absDestDir}/${pkg}`;

    if (test('-d', srcDir)) {
      console.info(`# Copy artifacts to ${destDir}`);
      rm('-rf', destDir);
      cp('-R', srcDir, destDir);
      chmod('-R', 'u+w', destDir);
      builtPackages.push({name: `@angular/${pkg}`, outputPath: destDir});
    }
  });

  console.info('');
  return builtPackages;
}

/**
 * Execute a command synchronously.
 *
 * By default, the current process' stdout is used (and thus the output is not captured and returned
 * to the caller). This is necessary for showing colors and modifying already printed output, for
 * example to show progress.
 *
 * If the caller requests the output (via `captureStdout: true`), the command is run without
 * printing anything to stdout and then (once the command has completed) the whole output is printed
 * to stdout and returned to the caller.
 *
 * @param {string} cmd The command to run.
 * @param {boolean} [captureStdout=false] Whether to return the output of the command.
 * @param {import('child_process').ExecSyncOptions} [options] The options to pass to `execSync()`.
 * @return {string | undefined} The captured stdout output if `captureStdout: true` or `undefined`.
 */
function exec(cmd, captureStdout, options) {
  const output = execSync(cmd, {
    stdio: [
      /* stdin  */ 'inherit',
      /* stdout */ captureStdout ? 'pipe' : 'inherit',
      /* stderr */ 'inherit',
    ],
    ...options,
  });

  if (captureStdout) {
    process.stdout.write(output);
    return output.toString().trim();
  }
}
