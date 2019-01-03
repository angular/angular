/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview This script runs as a postinstall in the published npm packages
 * and checks that the version of the Angular external repository matches that
 * of the published npm package.
 *
 * Note, this check is only performed with bazel managed deps when the yarn or
 * npm install is from a yarn_install or npm_install repository rule. For self
 * managed bazel deps this check is not performed and it is the responsibility
 * of the user to ensure that the versions match.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const semver = require('semver');

// Version in package.bzl should match the npm package version
// but this should be tolerant of development stamped versions such as
// "0.17.0-7-g76dc057"
const npmPackageVersion = process.env.npm_package_version.split('-')[0];

// If this is a bazel managed deps yarn_install or npm_install then the
// cwd is $(bazel info
// output_base)/external/<wksp>/node_modules/@angular/bazel and there should
// be $(bazel info output_base)/external/<wksp>/internal/generate_build_file.js
// folder
function isBazelManagedDeps() {
  try {
    fs.statSync('../../../generate_build_file.js');
    return true;
  } catch (e) {
    return false;
  }
}

if (isBazelManagedDeps()) {
  let contents;
  try {
    // If this is a yarn_install or npm_install then the cwd is $(bazel info
    // output_base)/external/<wksp>/node_modules/@angular/bazel so we can look for
    // the package.json file under $(bazel info
    // output_base)/external/angular/package.json
    const packagePath = path.resolve(process.cwd(), '../../../../angular/package.json');
    contents = require(packagePath);
  } catch (e) {
    throw new Error('The angular repository is not installed in your Bazel WORKSPACE file');
  }
  if (contents.name !== 'angular-srcs') {
    throw new Error('Invalid package.json in angular repository');
  }
  // Be tolerant of versions such as "0.17.0-7-g76dc057"
  const angularPackageVersion = contents.version.split('-')[0];
  // Should match only the major and minor versions
  const range = `${semver.major(angularPackageVersion)}.${semver.minor(angularPackageVersion)}.x`;
  if (!semver.satisfies(npmPackageVersion, range)) {
    throw new Error(
        `Expected angular npm version ${npmPackageVersion} to satisfy ${range}. ` +
        `Please update ANGULAR_VERSION in WORKSPACE file to match ${npmPackageVersion}`);
  }
} else {
  // No version check
  console.warn(`WARNING: With self managed deps you must ensure the @angular/bazel
npm package version matches the angular repository version.
Use yarn_install or npm_install for this version to be checked automatically.
`);
}
