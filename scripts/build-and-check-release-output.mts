/**
 * Script that builds the NPM release output for all packages
 * and runs sanity checks against the NPM package output.
 */

import fs from 'fs';
import semver from 'semver';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

import {performNpmReleaseBuild} from './build-packages-dist.mjs';
import {assertValidNpmPackageOutput} from '../tools/release-checks/npm-package-output/index.mjs';

async function main() {
  const projectDir = join(dirname(fileURLToPath(import.meta.url)), '..');
  const packageJsonContent = await fs.promises.readFile(join(projectDir, 'package.json'), 'utf8');
  const packageJson = JSON.parse(packageJsonContent) as {version: string};

  // Build the NPM package artifacts.
  const builtPackages = performNpmReleaseBuild();

  // Run the release output validation checks.
  await assertValidNpmPackageOutput(builtPackages, semver.parse(packageJson.version)!);
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
