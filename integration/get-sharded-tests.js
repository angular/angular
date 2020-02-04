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
const {_, shardIndex, maxShards} = minimist(process.argv.slice(2));

// Ensure that all CLI options are set properly.
if (shardIndex == null) {
  throw new Error('The "--shardIndex" option has not been specified.')
} else if (maxShards == null) {
  throw new Error('The "--maxShards" option has not been specified.');
}
if (shardIndex >= maxShards) {
  throw new Error('shardIndex out of bounds');
}

printTestNames(getTestsForShardIndex(_, shardIndex, maxShards));

/**
 * Splits the specified tests into a limited amount of shards and returns the tests that should
 * run on the given shard. The shards of tests are being created deterministically and therefore
 * we get reproducible tests when executing the same script multiple times.
 */
function getTestsForShardIndex(tests, shardIndex, maxShards) {
  return tests.filter((n, index) => index % maxShards === shardIndex);
}

/** Prints the specified test names to the stdout. */
function printTestNames(testNames) {
  // Print the test names joined with spaces because this allows Bash to easily convert the output
  // of this script into an array.
  process.stdout.write(testNames.join(' '));
}
