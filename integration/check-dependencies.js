#!/usr/bin/env node
'use strict';

const {parse: parseLockfile} = require('@yarnpkg/lockfile');
const {readFileSync} = require('fs');
const {resolve: resolvePath} = require('path');

const projectDir = resolvePath(process.argv[2]);
const pkgJsonPath = `${projectDir}/package.json`;
const lockfilePath = `${projectDir}/yarn.lock`;

console.log(`Checking dependencies for '${projectDir}'...`);

// Collect non-local dependencies (in `[name, version]` pairs).
// (Also ingore `git+https:` dependencies, because checking them is not straight-forward.)
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
      nonExactDeps.map(([name, version]) => `\n  ${name}: ${version}`));
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
      outOfSyncDeps.map(([name, pkgJsonVersion, lockfileVersion]) =>
        `\n  ${name}: ${pkgJsonVersion} vs ${lockfileVersion}`));
}
