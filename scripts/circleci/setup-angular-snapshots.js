/**
 * Script that sets up the Angular snapshot github builds. We set up the snapshot builds by
 * overwriting the versions in the "package.json" and taking advantage of Yarn's resolutions
 * feature. Yarn resolutions will be used to flatten nested Angular packages because by default
 * Yarn does not flatten any dependency. See:
 *
 *  node_modules/compiler@snapshot
 *  node_modules/compiler-cli@snapshot
 *    node_modules/compiler@7.0.1
 *
 * Note that we cannot just use Yarn's `--flat` option because that would mean that it tries
 * to flatten **all** dependencies and could cause unexpected results. We **only** want to
 * explicitly flatten out all `@angular/*` dependencies. This can be achieved with resolutions.
 * Read more here: https://yarnpkg.com/lang/en/docs/package-json/#toc-resolutions
 */

const {yellow, green} = require('chalk');
const {writeFileSync} = require('fs');
const {join} = require('path');
const {execSync} = require('child_process');

const projectDir = join(__dirname, '../../');
const packageJsonPath = join(projectDir, 'package.json');
const packageJson = require(packageJsonPath);

// Initialize the "resolutions" property in case it is not present in the "package.json" yet.
// See: https://yarnpkg.com/lang/en/docs/package-json/#toc-resolutions for the API.
packageJson['resolutions'] = packageJson['resolutions'] || {};

// List that contains the names of all installed Angular packages (e.g. "@angular/core")
const angularPackages = Object.keys({...packageJson.dependencies, ...packageJson.devDependencies})
  .filter(packageName => packageName.startsWith('@angular/'));

console.log(green('Setting up snapshot builds for:\n'));
console.log(yellow(`  ${angularPackages.join('\n  ')}\n`));

// Setup the snapshot version for each Angular package specified in the "package.json" file.
angularPackages.forEach(packageName => {
  const buildsUrl = `github:angular/${packageName.split('/')[1]}-builds`;
  // Add resolutions for each package in the format "**/{PACKAGE}" so that all
  // nested versions of that specific Angular package will have the same version.
  packageJson.resolutions[`**/${packageName}`] = buildsUrl;

  // Since the resolutions only cover the version of all nested installs, we also need
  // to explicitly set the version for the package listed in the project "package.json".
  packageJson.dependencies[packageName] = buildsUrl;

  // In case this dependency was previously a dev dependency, just remove it because we
  // re-added it as a normal dependency for simplicity.
  delete packageJson.devDependencies[packageName];
});

// Write changes to the "packageJson", so that we can install the new versions afterwards.
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(green('Successfully added the "resolutions" to the "package.json".'));

// Run "yarn" in the directory that contains the "package.json". Also pipe all output to the
// current process so that everything can be debugged within CircleCI.
execSync('yarn', {cwd: projectDir, stdio: 'inherit', shell: true});
