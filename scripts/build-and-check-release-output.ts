/**
 * Script that builds the NPM release output for all packages
 * and runs sanity checks against the NPM package output.
 */

import {performNpmReleaseBuild} from './build-packages-dist';
import {assertValidNpmPackageOutput} from '../tools/release-checks/npm-package-output';
import * as semver from 'semver';

const {version} = require('../package.json');

async function main() {
  // Build the NPM package artifacts.
  const builtPackages = performNpmReleaseBuild();

  // Run the release output validation checks.
  await assertValidNpmPackageOutput(builtPackages, semver.parse(version)!);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
