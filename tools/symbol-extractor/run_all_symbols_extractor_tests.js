/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(josephperrott): migrate golden testing to ng-dev toolset
const {spawnSync} = require('child_process');
const minimist = require('minimist');
const path = require('path');

// Remove all command line flags from the arguments.
const argv = minimist(process.argv.slice(2));
// The command the user would like to run, either 'accept' or 'test'
const USER_COMMAND = argv._[0];
// The shell command to query for all tests.
// Bazel targets for testing goldens
process.stdout.write('Gathering all symbol extractor targets');
const ALL_TEST_TARGETS =
    spawnSync(
        'yarn',
        [
          '-s', 'bazel', 'query', '--output', 'label',
          `'kind(nodejs_test, ...) intersect attr("tags", "symbol_extractor", ...)'`
        ],
        {encoding: 'utf8', shell: true, cwd: path.resolve(__dirname, '../..')})
        .stdout.trim()
        .split('\n')
        .map(line => line.trim());
process.stdout.clearLine();
process.stdout.cursorTo(0);
// Bazel targets for generating goldens
const ALL_ACCEPT_TARGETS = ALL_TEST_TARGETS.map(test => `${test}.accept`);

/** Run the provided bazel commands on each provided target individually. */
function runBazelCommandOnTargets(command, targets, present) {
  for (const target of targets) {
    process.stdout.write(`${present}: ${target}`);
    const commandResult =
        spawnSync('yarn', ['-s', 'bazel', command, '--config=ivy', target], {encoding: 'utf8'});
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
    runBazelCommandOnTargets('run', ALL_ACCEPT_TARGETS, 'Running');
    break;
  case 'test':
    runBazelCommandOnTargets('test', ALL_TEST_TARGETS, 'Testing');
    break;
  default:
    console.warn('Invalid command provided.');
    console.warn();
    console.warn(`Run this script with either "accept" and "test"`);
    break;
}
