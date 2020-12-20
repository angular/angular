const {exec} = require('shelljs');
const minimist = require('minimist');

// Remove all command line flags from the arguments.
const argv = minimist(process.argv.slice(2));
// The command the user would like to run, either 'accept' or 'test'
const USER_COMMAND = argv._[0];
// The shell command to query for all Public API guard tests.
const BAZEL_PUBLIC_API_TARGET_QUERY_CMD =
    `yarn -s bazel query --output label 'kind(nodejs_test, ...) intersect attr("tags", "api_guard", ...)'`
// Bazel targets for testing Public API goldens
process.stdout.write('Gathering all Public API targets');
const ALL_PUBLIC_API_TESTS = exec(BAZEL_PUBLIC_API_TARGET_QUERY_CMD, {silent: true})
                                 .trim()
                                 .split('\n')
                                 .map(test => test.trim());
process.stdout.clearLine();
process.stdout.cursorTo(0);
// Bazel targets for generating Public API goldens
const ALL_PUBLIC_API_ACCEPTS = ALL_PUBLIC_API_TESTS.map(test => `${test}.accept`);

/**
 * Run the provided bazel commands on each provided target individually.
 */
function runBazelCommandOnTargets(command, targets, present) {
  for (const target of targets) {
    process.stdout.write(`${present}: ${target}`);
    const commandResult = exec(`yarn -s bazel ${command} ${target}`, {silent: true});
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    if (commandResult.code) {
      console.error(`Failed ${command}: ${target}`);
      console.group();
      console.error(commandResult.stdout || commandResult.stderr);
      console.groupEnd();
    } else {
      console.log(`Successful ${command}: ${target}`);
    }
  }
}

switch (USER_COMMAND) {
  case 'accept':
    runBazelCommandOnTargets('run', ALL_PUBLIC_API_ACCEPTS, 'Running');
    break;
  case 'test':
    runBazelCommandOnTargets('test', ALL_PUBLIC_API_TESTS, 'Testing');
    break;
  default:
    console.warn('Invalid command provided.');
    console.warn();
    console.warn(`Run this script with either "accept" and "test"`);
    break;
}
