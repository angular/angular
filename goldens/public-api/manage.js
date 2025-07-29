const {exec} = require('shelljs');
const {Parser: parser} = require('yargs/helpers');

// Remove all command line flags from the arguments.
const argv = parser(process.argv.slice(2));
// The command the user would like to run, either 'accept' or 'test'
const USER_COMMAND = argv._[0];

// Location of all packages that we'd need to process.
const API_TARGETS_LOCATION = 'packages/...';

// The shell command to query for all Public API guard tests.
const BAZEL_PUBLIC_API_TARGET_QUERY_CMD =
  `yarn -s bazel query --output label 'kind(js_test, ${API_TARGETS_LOCATION}) ` +
  `intersect attr("tags", "api_guard", ${API_TARGETS_LOCATION})'`;
// Bazel targets for testing Public API goldens
process.stdout.write('Gathering all Public API targets...');
const ALL_PUBLIC_API_TESTS = exec(BAZEL_PUBLIC_API_TARGET_QUERY_CMD, {silent: true})
  .trim()
  .split('\n')
  .map((test) => test.trim());
process.stdout.clearLine();
process.stdout.cursorTo(0);

// Bazel targets for generating Public API goldens
const ALL_PUBLIC_API_ACCEPTS = ALL_PUBLIC_API_TESTS.map((test) => `${test}.accept`);

/** Builds all targets in parallel. */
function buildTargets(targets) {
  process.stdout.write('Building all public API targets...');
  const commandResult = exec(`yarn -s bazel build ${targets.join(' ')}`, {silent: true});
  if (commandResult.code) {
    console.error(commandResult.stdout || commandResult.stderr);
  } else {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
}

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
    buildTargets(ALL_PUBLIC_API_ACCEPTS);
    runBazelCommandOnTargets('run', ALL_PUBLIC_API_ACCEPTS, 'Running');
    break;
  case 'test':
    buildTargets(ALL_PUBLIC_API_TESTS);
    runBazelCommandOnTargets('test', ALL_PUBLIC_API_TESTS, 'Testing');
    break;
  default:
    console.warn('Invalid command provided.');
    console.warn();
    console.warn(`Run this script with either "accept" and "test"`);
    break;
}
