/**
 * Script that sets up the MDC snapshot github builds. We set up the snapshot builds by
 * overwriting the versions in the "package.json" and taking advantage of Yarn's resolutions
 * feature. Yarn resolutions will be used to overwrite nested MDC package versions.
 *
 *  node_modules/@material/toolbar@snapshot
 *  node_modules/material-components-web@latest
 *    node_modules/@material/toolbar@snapshot
 */

const {yellow, green} = require('chalk');
const {writeFileSync, existsSync} = require('fs');
const {join} = require('path');
const globSync = require('glob').sync;

const args = process.argv.slice(2);
const [mdcPackagesPath, uniqueId] = args;
const projectDir = join(__dirname, '../../');
const packageJsonPath = join(projectDir, 'package.json');
const packageJson = require(packageJsonPath);

if (!mdcPackagesPath || !uniqueId) {
  throw Error('Usage: node ./scripts/setup-mdc-snapshots.js <mdcPackagesPath> <uniqueId>');
}

// Initialize the "resolutions" property in case it is not present in the "package.json" yet.
// See: https://yarnpkg.com/lang/en/docs/package-json/#toc-resolutions for the API.
packageJson['resolutions'] = packageJson['resolutions'] || {};

const mdcPackages = globSync('./*/', {cwd: mdcPackagesPath, absolute: true});

for (let packagePath of mdcPackages) {
  const pkgJsonPath = join(packagePath, 'package.json');
  
  if (!existsSync(pkgJsonPath)) {
    continue;
  }

  const packageName = require(pkgJsonPath).name;
  const newPackageVersion = `file:${packagePath}`;

  // Add resolutions for each package in the format "**/{PACKAGE}" so that all
  // nested versions of that specific MDC package will have the same version.
  packageJson.resolutions[`**/${packageName}`] = newPackageVersion;

  // Since the resolutions only cover the version of all nested installs, we also need
  // to explicitly set the version for the package listed in the project "package.json".
  packageJson.dependencies[packageName] = newPackageVersion;

  // In case this dependency was previously a dev dependency, just remove it because we
  // re-added it as a normal dependency for simplicity.
  delete packageJson.devDependencies[packageName];
}

// Update the version field in the "package.json" to a new version that contains
// the specified unique id. We need to ensure that the "package.json" is different
// if something changes upstream in the MDC repository as Bazel otherwise incorrectly
// re-uses results from previous builds.
packageJson.version = `${packageJson.version}-${uniqueId}`;

// Write changes to the "packageJson", so that we can install the new versions afterwards.
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(green('Successfully added the "resolutions" to the "package.json".'));
