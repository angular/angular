#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * Script that updates a dependencies in a specified `package.json` file to be
 * based on the dependencies of the specified base `package.json`. This allows
 * developers to sync dependencies between two `package.json` files without having
 * to manually copy versions all the time.
 *
 * e.g. `/package.json` defines the project dependencies. The `dev-infra/package.json`
 * uses a subset of these dependencies and declares these as dependencies for the shared
 * package. The dependencies should be the same as the one from `/package.json` as those
 * versions are used for testing and development. We don't want mismatching versions.
 */

const fs = require('fs');
const args = process.argv.slice(2);
const [inputPackageJsonPath, basePackageJsonPath, outputPath] = args;
const BASE_DEPENDENCY_MARKER = '<from-root>';

if (!inputPackageJsonPath || !basePackageJsonPath || !outputPath) {
  console.error('Usage: ./inline-package-json-deps.js <input-pkg-json> <base-pkg-json> <out-path>');
  process.exit(1);
}

const inputPackageJson = JSON.parse(fs.readFileSync(inputPackageJsonPath, 'utf8'));
const basePackageJson = JSON.parse(fs.readFileSync(basePackageJsonPath, 'utf8'));
const result = {...inputPackageJson};

if (inputPackageJson.dependencies) {
  inlineDependenciesFromBase(inputPackageJson.dependencies);
}
if (inputPackageJson.peerDependencies) {
  inlineDependenciesFromBase(inputPackageJson.peerDependencies);
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

/**
 * Updates dependencies which have their version set to the base marker,
 * to match the version from the base `package.json` file.
 */
function inlineDependenciesFromBase(deps) {
  Object.keys(deps).forEach(name => {
    const value = deps[name];
    if (value !== BASE_DEPENDENCY_MARKER) {
      return;
    }
    const linkedVersion = getDependency(basePackageJson, name);
    if (linkedVersion === null) {
      console.error(`Could not find base version for: ${name}`);
      console.error(
          `Either set a version for ${name} in "${basePackageJsonPath}", or use ` +
          `an explicit version in "${inputPackageJson}"`);
      process.exit(1);
    }
    deps[name] = linkedVersion;
  });
}

/** Gets the version of the specified package from the given package object. */
function getDependency(packageJson, name) {
  if (packageJson.dependencies && packageJson.dependencies[name]) {
    return packageJson.dependencies[name];
  }
  if (packageJson.devDependencies && packageJson.devDependencies[name]) {
    return packageJson.devDependencies[name];
  }
  return null;
}
