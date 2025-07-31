/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// TODO(josephperrott): migrate golden testing to ng-dev toolset
const {spawnSync} = require('child_process');
const {Parser: parser} = require('yargs/helpers');
const path = require('path');

// Location of all targets that we'd need to run.
const TEST_TARGETS_LOCATION = 'packages/core/test/bundling/...';

// Remove all command line flags from the arguments.
const argv = parser(process.argv.slice(2));

// The command the user would like to run, either 'accept' or 'test'
const USER_COMMAND = argv._[0];

// The shell command to query for all tests.
// Bazel targets for testing goldens
process.stdout.write('Gathering all symbol extractor targets...');

const BAZEL_QUERY =
  `'kind(js_test, ${TEST_TARGETS_LOCATION}) ` +
  `intersect attr("tags", "symbol_extractor", ${TEST_TARGETS_LOCATION})'`;
const ALL_TEST_TARGETS = spawnSync(
  'pnpm',
  ['--silent', 'bazel', 'query', '--output', 'label', BAZEL_QUERY],
  {encoding: 'utf8', shell: true, cwd: path.resolve(__dirname, '../..')},
)
  .stdout.trim()
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

if (ALL_TEST_TARGETS.length === 0) {
  console.error(`Could not find any symbol test targets matching query: ${BAZEL_QUERY}`);
  process.exit(1);
}

process.stdout.clearLine();
process.stdout.cursorTo(0);
// Bazel targets for generating goldens
const ALL_ACCEPT_TARGETS = ALL_TEST_TARGETS.map((test) => `${test}.accept`);

/** Builds all targets in parallel. */
function buildTargets(targets) {
  process.stdout.write('Building all symbol extractor targets...');
  const commandResult = spawnSync('pnpm', ['--silent', 'bazel', 'build', targets.join(' ')], {
    encoding: 'utf8',
    shell: true,
  });
  if (commandResult.status) {
    console.error(commandResult.stdout || commandResult.stderr);
  } else {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
}

/** Run the provided bazel commands on each provided target individually. */
function runBazelCommandOnTargets(command, targets, present) {
  for (const target of targets) {
    process.stdout.write(`${present}: ${target}`);
    const commandResult = spawnSync('pnpm', ['--silent', 'bazel', command, target], {
      encoding: 'utf8',
    });
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    if (commandResult.status) {
      console.error(`Failed ${command}: ${target}`);
      console.group();
      console.error(commandResult.stdout || commandResult.stderr);
      console.groupEnd();
    } else {
      console.info(`Successful ${command}: ${target}`);
    }
  }
}

switch (USER_COMMAND) {
  case 'accept':
    buildTargets(ALL_ACCEPT_TARGETS);
    runBazelCommandOnTargets('run', ALL_ACCEPT_TARGETS, 'Running');
    break;
  case 'test':
    buildTargets(ALL_TEST_TARGETS);
    runBazelCommandOnTargets('test', ALL_TEST_TARGETS, 'Testing');
    break;
  default:
    console.warn('Invalid command provided.');
    console.warn();
    console.warn(`Run this script with either "accept" and "test"`);
    break;
}
