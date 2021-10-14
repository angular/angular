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

/** List of packages which should not be updated to a snapshot build. */
const ignorePackages = [
  // Skip update for the shared dev-infra package. We do not want to update to a snapshot
  // version of the dev-infra tooling as that could break tooling from running snapshot
  // tests for the actual snapshot Angular framework code.
  '@angular/dev-infra-private',
];

const {writeFileSync} = require('fs');
const {join} = require('path');

const [tag] = process.argv.slice(2);
const projectDir = join(__dirname, '../../');
const packageJsonPath = join(projectDir, 'package.json');
const packageJson = require(packageJsonPath);
const packageSuffix = tag ? ` (${tag})` : '';

// Initialize the "resolutions" property in case it is not present in the "package.json" yet.
// See: https://yarnpkg.com/lang/en/docs/package-json/#toc-resolutions for the API.
packageJson['resolutions'] = packageJson['resolutions'] || {};

// List of packages which should be updated to their most recent snapshot version, or
// snapshot version based on the specified tag.
const snapshotPackages = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}).filter(
  packageName => packageName.startsWith('@angular/') && !ignorePackages.includes(packageName),
);

console.log('Setting up snapshot builds for:\n');
console.log(`  ${snapshotPackages.map(n => `${n}${packageSuffix}`).join('\n  ')}\n`);

// Setup the snapshot version for each Angular package specified in the "package.json" file.
snapshotPackages.forEach(packageName => {
  const buildsUrl = `github:angular/${packageName.split('/')[1]}-builds${tag ? `#${tag}` : ''}`;

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

console.log('Successfully added the "resolutions" to the "package.json".');
