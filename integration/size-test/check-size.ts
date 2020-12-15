/*
 * Script that measures the size of a given test file and compares it
 * with an entry in a file size golden. If the size deviates by certain
 * amount, the script will fail with a non-zero exit code.
 */

import * as chalk from 'chalk';
import {readFileSync, statSync, writeFileSync} from 'fs';
import {parse, stringify} from 'yaml';

/**
 * Absolute byte deviation from the expected value that is allowed. If the
 * size deviates by 500 bytes of the expected value, the script will fail.
 */
const ABSOLUTE_BYTE_THRESHOLD = 500;
/**
 * Percentage deviation from the expected value that is allowed. If the
 * size deviates by 1% of the expected value, the script will fail.
 */
const PERCENTAGE_DEVIATION_THRESHOLD = 1;

/** Type that represents the parsed size-test golden. */
type Golden = {[testId: string]: number};

/**
 * Extracted command line arguments specified by the Bazel NodeJS binaries:
 *  - `testId`: Unique id for the given test file that is used as key in the golden.
 *  - `testFileRootpath`: Bazel rootpath that resolves to the test file that should be measured.
 *  - `isApprove`: Whether the script runs in approve mode, and the golden should be updated
 *                 with the actual measured size.
 */
const [testId, testFileRootpath, isApprove] = process.argv.slice(2);
const testFilePath = require.resolve(`angular_material/${testFileRootpath}`);
const goldenFilePath = require.resolve('../../goldens/size-test.yaml');

const golden: Golden = parse(readFileSync(goldenFilePath, 'utf8')) || {};
const fileStat = statSync(testFilePath);
const actualSize = fileStat.size;

// If in approve mode, update the golden to reflect the new size.
if (isApprove) {
  golden[testId] = actualSize;
  writeFileSync(goldenFilePath, stringify(getSortedGolden()));
  console.info(chalk.green(`Approved golden size for "${testId}"`));
  process.exit(0);
}

// If no size has been collected for the test id, report an error.
if (golden[testId] === undefined) {
  console.error(`No golden size for "${testId}". Please create a new entry.`);
  printApproveCommand();
  process.exit(1);
}

const expectedSize = Number(golden[testId]);
const absoluteSizeDiff = Math.abs(actualSize - expectedSize);
const deviatedByPercentage =
    absoluteSizeDiff > (expectedSize * PERCENTAGE_DEVIATION_THRESHOLD / 100);
const deviatedByAbsoluteDiff = absoluteSizeDiff > ABSOLUTE_BYTE_THRESHOLD;

// Always print the expected and actual size so that it's easier to find culprit
// commits when the size slowly moves toward the threshold boundaries.
console.info(chalk.yellow(`Expected: ${expectedSize}, but got: ${actualSize}`));

if (deviatedByPercentage) {
  console.error(`Actual size deviates by more than 1% of the expected size. `);
  printApproveCommand();
  process.exit(1);
} else if (deviatedByAbsoluteDiff) {
  console.error(`Actual size deviates by more than 500 bytes from the expected.`);
  printApproveCommand();
  process.exit(1);
}

/** Prints the command for approving the current test. */
function printApproveCommand() {
  console.info(chalk.yellow('You can approve the golden by running the following command:'));
  console.info(chalk.yellow(`  bazel run ${process.env.BAZEL_TARGET}.approve`));
}

/** Gets the lexicographically sorted size-test golden. */
function getSortedGolden(): Golden {
  return Object.keys(golden).sort().reduce((result: Golden, key: string) => {
    return {...result, [key]: golden[key]};
  }, {} as Golden);
}
