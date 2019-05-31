/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * Script that determines the sharded tests for the current CircleCI container. CircleCI starts
 * multiple containers if the "parallelism" option has been specified and this script splits up
 * the integration tests into shards based on the amount of parallelism.
 *
 * It's also possible to manually specify tests which should run on a container because some
 * integration tests are more complex and take up more time. In order to properly balance the
 * duration of each container, we allow manual test shards to be specified.
 *
 * The output of this script can then be used to only run the tests which are assigned to the
 * current CircleCI container.
 */

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// Parsed command line arguments.
const {shardIndex, maxShards} = minimist(process.argv.slice(2));

// Ensure that all CLI options are set properly.
if (shardIndex == null) {
  throw new Error('The "--shardIndex" option has not been specified.')
} else if (maxShards == null) {
  throw new Error('The "--maxShards" option has not been specified.');
}

// List of all integration tests that are available.
const integrationTests = fs.readdirSync(__dirname).filter(
    testName => fs.statSync(path.join(__dirname, testName)).isDirectory());

// Manual test shards which aren't computed automatically. This is helpful when a specific
// set of integration test takes up *way* more time than all other tests, and we want to
// balance out the duration for all specific shards.
const manualTestShards = [
  // The first shard should only run the bazel integration tests because these take up
  // a lot of time and shouldn't be split up automatically.
  ['bazel', 'bazel-schematics']
];

// Tests which haven't been assigned manually to a shard. These tests will be automatically
// split across the remaining available shards.
const unassignedTests = stripManualOverrides(integrationTests, manualTestShards);

if (manualTestShards.length === maxShards && unassignedTests.length) {
  throw new Error(
      `Tests have been specified manually for all available shards, but there were ` +
      `integration tests which haven't been specified and won't run right now. Missing ` +
      `tests: ${unassignedTests.join(', ')}`)
} else if (manualTestShards.length > maxShards) {
  throw new Error(
      `Too many manual shards have been specified. Increase the amount of maximum shards.`);
}

// In case the shard for the current index has been specified manually, we just output
// the tests for the manual shard.
if (manualTestShards[shardIndex]) {
  printTestNames(manualTestShards[shardIndex]);
} else {
  const amountManualShards = manualTestShards.length;
  // In case there isn't a manual shard specified for this shard index, we just compute the
  // tests for this shard. Note that we need to subtract the amount of manual shards because
  // we need to split up the unassigned tests across the remaining available shards.
  printTestNames(getTestsForShardIndex(
      unassignedTests, shardIndex - amountManualShards, maxShards - amountManualShards));
}

/**
 * Splits the specified tests into a limited amount of shards and returns the tests that should
 * run on the given shard. The shards of tests are being created deterministically and therefore
 * we get reproducible tests when executing the same script multiple times.
 */
function getTestsForShardIndex(tests, shardIndex, maxShards) {
  return tests.filter((n, index) => index % maxShards === shardIndex);
}

/**
 * Strips all manual tests from the list of integration tests. This is necessary because
 * when computing the shards automatically we don't want to include manual tests again. This
 * would mean that CircleCI runs some integration tests multiple times.
 */
function stripManualOverrides(integrationTests, manualShards) {
  const allManualTests = manualShards.reduce((res, manualTests) => res.concat(manualTests), []);
  return integrationTests.filter(testName => !allManualTests.includes(testName))
}

/** Prints the specified test names to the stdout. */
function printTestNames(testNames) {
  // Print the test names joined with spaces because this allows Bash to easily convert the output
  // of this script into an array.
  process.stdout.write(testNames.join(' '));
}
