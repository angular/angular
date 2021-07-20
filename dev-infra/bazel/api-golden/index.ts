/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import * as chalk from 'chalk';

import {testApiGolden} from './test_api_report';

/**
 * Entry point for the `api_golden_test` Bazel rule. This function builds an API report for
 * the specified entry point file and compares it against the specified golden file.
 */
async function main(
    goldenFilePath: string, entryPointFilePath: string, approveGolden: boolean,
    stripExportPattern: RegExp, typeNames: string[]) {
  const {succeeded, apiReportChanged} = await testApiGolden(
      goldenFilePath, entryPointFilePath, approveGolden, stripExportPattern, typeNames);

  if (!succeeded && apiReportChanged) {
    console.error(chalk.red(`The API signature has changed and the golden file is outdated.`));
    console.info(chalk.yellow(
        `Golden can be updated by running: yarn bazel run ${process.env.TEST_TARGET}.accept`));
  }

  // Bazel expects `3` as exit code for failing tests.
  process.exitCode = succeeded ? 0 : 3;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const goldenFilePath = runfiles.resolve(args[0]);
  const entryPointFilePath = runfiles.resolve(args[1]);
  const approveGolden = args[2] === 'true';
  const stripExportPattern = new RegExp(args[3]);
  const typeNames = args.slice(4);

  main(goldenFilePath, entryPointFilePath, approveGolden, stripExportPattern, typeNames)
      .catch(e => {
        console.error(e);
        process.exit(1);
      });
}
