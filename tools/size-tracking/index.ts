/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chalk from 'chalk';
import {readFileSync, writeFileSync} from 'fs';

import {compareFileSizeData} from './file_size_compare';
import {FileSizeData} from './file_size_data';
import {SizeTracker} from './size_tracker';

if (require.main === module) {
  const [filePath, sourceMapPath, goldenPath, maxPercentageDiffArg, maxSizeDiffArg, writeGoldenArg, requiredCompileMode] =
      process.argv.slice(2);
  const status = main(
      require.resolve(filePath), require.resolve(sourceMapPath), require.resolve(goldenPath),
      writeGoldenArg === 'true', parseInt(maxPercentageDiffArg), parseInt(maxSizeDiffArg),
      requiredCompileMode);

  process.exit(status ? 0 : 1);
}

export function main(
    filePath: string, sourceMapPath: string, goldenSizeMapPath: string, writeGolden: boolean,
    maxPercentageDiff: number, maxByteDiff: number, requiresIvy: string): boolean {
  const {sizeResult} = new SizeTracker(filePath, sourceMapPath);
  const ivyEnabled = process.env['angular_ivy_enabled'] == 'True';

  if (requiresIvy && ivyEnabled) {
    console.error(chalk.red(
        `Expected the size-tracking tool to be run with: ` +
        `--config=${requiresIvy ? 'ivy' : 'view-engine'}`));
    return false;
  }

  if (writeGolden) {
    writeFileSync(goldenSizeMapPath, JSON.stringify(sizeResult, null, 2));
    console.error(chalk.green(`Updated golden size data in ${goldenSizeMapPath}`));
    return true;
  }

  const expectedSizeData = JSON.parse(readFileSync(goldenSizeMapPath, 'utf8')) as FileSizeData;
  const differences =
      compareFileSizeData(sizeResult, expectedSizeData, {maxByteDiff, maxPercentageDiff});

  if (!differences.length) {
    return true;
  }

  console.error(
      `Computed file size data does not match golden size data. ` +
      `The following differences were found:\n`);
  differences.forEach(({filePath, message}) => {
    const failurePrefix = filePath ? `"${filePath}": ` : '';
    console.error(chalk.red(`    ${failurePrefix}${message}`));
  });

  const bazelTargetName = process.env['TEST_TARGET'];

  console.error(`\nThe golden file can be updated with the following command:`);
  console.error(`    yarn bazel run --config=${ivyEnabled ? 'ivy' : 'view-engine'} ${
      bazelTargetName}.accept`);
  return false;
}
