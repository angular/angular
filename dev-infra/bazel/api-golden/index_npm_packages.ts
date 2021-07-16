/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import * as chalk from 'chalk';
import {join, relative} from 'path';

import {findEntryPointsWithinNpmPackage} from './find_entry_points';
import {testApiGolden} from './test_api_report';

/**
 * Entry point for the `api_golden_test_npm_package` Bazel rule. This function determines
 * all types within the specified NPM package and builds API reports that will be compared
 * against golden files within the given golden directory.
 */
async function main(
    goldenDir: string, npmPackageDir: string, approveGolden: boolean, stripExportPattern: RegExp,
    typeNames: string[]) {
  const entryPoints = findEntryPointsWithinNpmPackage(npmPackageDir);
  const outdatedGoldens: string[] = [];
  let allTestsSucceeding = true;

  for (const {packageJsonPath, typesEntryPointPath} of entryPoints) {
    const pkgRelativeName = relative(npmPackageDir, typesEntryPointPath);
    // API extractor generates API reports as markdown files. For each types
    // entry-point we maintain a separate golden file. These golden files are
    // based on the name of the entry-point `.d.ts` file in the NPM package,
    // but with the proper `.md` file extension.
    // See: https://api-extractor.com/pages/overview/demo_api_report/.
    const goldenName = pkgRelativeName.replace(/\.d\.ts$/, '.md');
    const goldenFilePath = join(goldenDir, goldenName);

    const {succeeded, apiReportChanged} = await testApiGolden(
        goldenFilePath, typesEntryPointPath, approveGolden, stripExportPattern, typeNames,
        packageJsonPath);

    // Keep track of outdated goldens.
    if (!succeeded && apiReportChanged) {
      outdatedGoldens.push(goldenName);
    }

    allTestsSucceeding = allTestsSucceeding && succeeded;
  }

  if (outdatedGoldens.length) {
    console.error(chalk.red(`The following goldens are outdated:`));
    outdatedGoldens.forEach(name => console.info(`-  ${name}`));
    console.info();
    console.info(chalk.yellow(
        `The goldens can be updated by running: yarn bazel run ${process.env.TEST_TARGET}.accept`));
  }

  // Bazel expects `3` as exit code for failing tests.
  process.exitCode = allTestsSucceeding ? 0 : 3;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const goldenDir = runfiles.resolve(args[0]);
  const npmPackageDir = runfiles.resolve(args[1]);
  const approveGolden = args[2] === 'true';
  const stripExportPattern = new RegExp(args[3]);
  const typeNames = args.slice(4);

  main(goldenDir, npmPackageDir, approveGolden, stripExportPattern, typeNames).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
