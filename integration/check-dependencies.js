#!/usr/bin/env node

/**
 * **Usage:**
 * ```
 * node check-depenencies <project-directory-path>
 * ```
 *
 * Checks the non-local dependencies of the specified project and ensures that:
 * - Exact versions (not version ranges) are specified in the project's `package.json`.
 *   This reduces the probability of installing a breaking version of a direct or transitive
 *   dependency, in case of an out-of-sync lockfile.
 * - The project's lockfile (`yarn.lock`) is in-sync with `package.json` wrt these dependencies.
 *
 * If any of the above checks fails, the script will throw an error, otherwise it will complete
 * successfully.
 *
 * **Context:**
 * In order to keep integration tests on CI as determinitstic as possible, we need to ensure that
 * the same dependencies (including transitive ones) are installed each time. One way to ensure that
 * is using a lockfile (such as `yarn.lock`) to pin the dependencies to exact versions. This works
 * as long as the lockfile itself is in-sync with the corresponding `package.json`, which specifies
 * the dependencies.
 *
 * Ideally, we would run `yarn install` with the `--frozen-lockfile` option to verify that the
 * lockfile is in-sync with `package.json`, but we cannot do that for integration projects, because
 * we want to be able to install the locally built Angular packages). Therefore, we must manually
 * ensure that the integration project lockfiles remain in-sync, which is error-prone.
 *
 * The checks performed by this script (although not full-proof) provide another line of defense
 * against indeterminism caused by unpinned dependencies.
 */
'use strict';

const {parse: parseLockfile} = require('@yarnpkg/lockfile');
const {readFileSync} = require('fs');
const {resolve: resolvePath} = require('path');

const projectDir = resolvePath(process.argv[2]);
const pkgJsonPath = `${projectDir}/package.json`;
const lockfilePath = `${projectDir}/yarn.lock`;

console.log(`Checking dependencies for '${projectDir}'...`);

// Collect non-local dependencies (in `[name, version]` pairs).
// (Also ignore `git+https:` dependencies, because checking them is not straight-forward.)
const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
const deps = [
  ...Object.entries(pkgJson.dependencies || {}),
  ...Object.entries(pkgJson.devDependencies || {}),
].filter(([, version]) => !/^(?:file|git\+https):/.test(version));

// Check for dependencies with non-exact versions.
const nonExactDeps = deps.filter(([, version]) => !/^\d+\.\d+\.\d+(?:-\w+\.\d+)?$/.test(version));

if (nonExactDeps.length) {
  throw new Error(
    `The following dependencies in '${projectDir}' are not pinned to exact versions (of the ` +
      'format X.Y.Z[-<pre-release-identifier>]):' +
      nonExactDeps.map(([name, version]) => `\n  ${name}: ${version}`),
  );
}

// Check for dependencies that are not in-sync between `package.json` and the lockfile.
const {object: parsedLockfile} = parseLockfile(readFileSync(lockfilePath, 'utf8'));
const outOfSyncDeps = deps
  .map(([depName, pkgJsonVersion]) => [
    depName,
    pkgJsonVersion,
    (parsedLockfile[`${depName}@${pkgJsonVersion}`] || {}).version,
  ])
  .filter(([, pkgJsonVersion, lockfileVersion]) => pkgJsonVersion !== lockfileVersion);

if (outOfSyncDeps.length) {
  throw new Error(
    `The following dependencies in '${projectDir}' are out-of-sync between 'package.json' and ` +
      'the lockfile:' +
      outOfSyncDeps.map(
        ([name, pkgJsonVersion, lockfileVersion]) =>
          `\n  ${name}: ${pkgJsonVersion} vs ${lockfileVersion}`,
      ),
  );
}
