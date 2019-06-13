/**
 * This script updates a package.json file by replacing all dependencies and devDependencies
 * such that all packages from the @angular scope point to the packages-dist directory.
 */
'use strict';

const {yellow, green} = require('chalk');
const {existsSync, writeFileSync} = require('fs');
const {resolve} = require('path');

const [, , packageJsonPath, distPackagesRoot] = process.argv;

const packageJson = require(packageJsonPath);

const updated = [];
const skipped = [];
function updateDeps(dependencies) {
  for (const packageName of Object.keys(dependencies)) {
    // We're only interested to update packages in the @angular scope
    if (!packageName.startsWith('@angular/')) {
      continue;
    }

    // Within the package-dist directory there's no scope name
    const packageNameWithoutScope = packageName.replace('@angular/', '');
    const packagePath = resolve(distPackagesRoot, packageNameWithoutScope);

    // Check whether the package exists in dist-packages. Not all packages
    // in the @angular scope are published from the main Angular repo.
    if (existsSync(packagePath)) {
      // Update the dependency to point to the dist-packages location.
      dependencies[packageName] = `file:${packagePath}`;
      updated.push(packageName);
    } else {
      skipped.push(packageName);
    }
  }
}


// Update dependencies from @angular scope to those in the dist-packages folder
updateDeps(packageJson.dependencies);
updateDeps(packageJson.devDependencies);

// Write the updated package.json contents
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Log all packages that were updated
if (updated.length > 0) {
  console.log(green(`Updated ${packageJsonPath} to packages in ${distPackagesRoot}:`));
  console.log(`  ${updated.join('\n  ')}\n`);
}

// Log the packages that were skipped, as they were not present in the packages-dist directory
if (skipped.length > 0) {
  console.log(yellow(`Did not update packages that were not present in ${distPackagesRoot}:`));
  console.log(`  ${skipped.join('\n  ')}\n`);
}
