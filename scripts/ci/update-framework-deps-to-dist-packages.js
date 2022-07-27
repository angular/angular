/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * This script updates a package.json file by replacing all dependencies and devDependencies
 * such that all packages from the @angular scope and zone.js point to the packages-dist directory.
 *
 * Please be aware that updating of versions might introduce compatibility issues. For instance,
 * if a peer dependency of Angular, e.g. "typescript" changes, the package.json that is updated
 * by this script will not have updated the "typescript" dependency to satisfy the peer dependency
 * requirement. As a result, incompatibility errors might occur.
 */
'use strict';

const {yellow, green} = require('chalk');
const {existsSync, writeFileSync} = require('fs');
const {resolve} = require('path');

const [, , packageJsonPath, packagesDistRoot] = process.argv;

const packageJson = require(packageJsonPath);

const updated = [];
const skipped = [];
function updateDeps(dependencies) {
  for (const packageName of Object.keys(dependencies)) {
    // We're only interested to update packages in the `@angular` scope and `zone.js`.
    // The shared dev-infra packages are not updated as it's not a package that is part
    // of the Angular framework.
    if ((!packageName.startsWith('@angular/') && packageName !== 'zone.js') ||
        packageName === '@angular/build-tooling' || packageName === '@angular/ng-dev') {
      continue;
    }

    // Within the packages-dist directory there's no scope name
    const packageNameWithoutScope = packageName.replace('@angular/', '');
    const packagePath = resolve(packagesDistRoot, packageNameWithoutScope);

    // Check whether the package exists in packages-dist. Not all packages
    // in the @angular scope are published from the main Angular repo.
    if (existsSync(packagePath)) {
      // Update the dependency to point to the packages-dist location.
      dependencies[packageName] = `file:${packagePath}`;
      updated.push(packageName);
    } else {
      skipped.push(packageName);
    }
  }
}

// Update dependencies from @angular scope to those in the packages-dist folder
updateDeps(packageJson.dependencies);
updateDeps(packageJson.devDependencies);

// Write the updated package.json contents
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Log all packages that were updated
if (updated.length > 0) {
  console.info(green(`Updated ${packageJsonPath} to packages in ${packagesDistRoot}:`));
  console.info(`  ${updated.join('\n  ')}\n`);
}

// Log the packages that were skipped, as they were not present in the packages-dist directory
if (skipped.length > 0) {
  console.info(yellow(`Did not update packages that were not present in ${packagesDistRoot}:`));
  console.info(`  ${skipped.join('\n  ')}\n`);
}
