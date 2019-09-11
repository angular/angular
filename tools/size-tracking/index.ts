/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {SizeTracker} from './size_tracker';
import chalk from 'chalk';
import {compareFileSizeData} from './file_size_compare';
import {FileSizeData} from './file_size_data';

if (require.main === module) {
  const
      [filePath, sourceMapPath, goldenPath, maxPercentageDiffArg, maxSizeDiffArg, writeGoldenArg,
       requiredCompileMode] = process.argv.slice(2);
  const status = main(
      require.resolve(filePath), require.resolve(sourceMapPath), require.resolve(goldenPath),
      writeGoldenArg === 'true', parseInt(maxPercentageDiffArg), parseInt(maxSizeDiffArg),
      requiredCompileMode);

  process.exit(status ? 0 : 1);
}

export function main(
    filePath: string, sourceMapPath: string, goldenSizeMapPath: string, writeGolden: boolean,
    maxPercentageDiff: number, maxByteDiff: number, requiredCompileMode: string): boolean {
  const {sizeResult} = new SizeTracker(filePath, sourceMapPath);
  const compileMode = process.env['compile'];

  if (requiredCompileMode && compileMode !== requiredCompileMode) {
    console.error(chalk.red(
        `Expected the size-tracking tool to be run with: ` +
        `--define=compile=${requiredCompileMode}`));
    return false;
  }

  if (writeGolden) {
    writeFileSync(goldenSizeMapPath, JSON.stringify(sizeResult, null, 2));
    console.error(chalk.green(`Updated golden size data in ${goldenSizeMapPath}`));
    return true;
  }

  const expectedSizeData = <FileSizeData>JSON.parse(readFileSync(goldenSizeMapPath, 'utf8'));
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
  const defineFlag = (compileMode !== 'legacy') ? `--define=compile=${compileMode} ` : '';

  console.error(`\nThe golden file can be updated with the following command:`);
  console.error(`    yarn bazel run ${defineFlag}${bazelTargetName}.accept`);
  return false;
}
