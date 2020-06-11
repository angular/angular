#!/usr/bin/env node

/**
 * Script that simplifies the workflow of running unit tests for a component
 * using Bazel. Here are a few examples:
 *
 *   node ./scripts/run-component-tests all               | Runs tests for all components
 *   node ./scripts/run-component-tests button            | Runs Material button tests
 *   node ./scripts/run-component-tests overlay           | Runs CDK overlay tests
 *   node ./scripts/run-component-tests src/cdk/a11y      | Runs CDK a11y tests
 *   node ./scripts/run-component-tests a11y overlay      | Runs CDK a11y and overlay tests
 *
 * Supported command line flags:
 *
 *   --local    | If specified, no browser will be launched.
 *   --firefox  | Instead of Chrome being used for tests, Firefox will be used.
 *   --no-watch | Watch mode is enabled by default. This flag opts-out to standard Bazel.
 */

const minimist = require('minimist');
const shelljs = require('shelljs');
const chalk = require('chalk');
const path = require('path');
const args = process.argv.slice(2);

// Path to the project directory.
const projectDir = path.join(__dirname, '../');

// Path to the directory that contains all packages.
const packagesDir = path.join(projectDir, 'src/');

// List of packages where the specified component could be defined in. The script uses the
// first package that contains the component (if no package is specified explicitly).
// e.g. "button" will become "material/button", and "overlay" becomes "cdk/overlay".
const orderedGuessPackages = ['material', 'cdk', 'material-experimental', 'cdk-experimental'];

/** Map of common typos in target names. The key is the typo, the value is the correct form. */
const commonTypos = new Map([
  ['snackbar', 'snack-bar'],
]);

// ShellJS should exit if any command fails.
shelljs.set('-e');
shelljs.cd(projectDir);

// Extracts the supported command line options.
const {_: components, local, firefox, watch, 'view-engine': viewEngine} = minimist(args, {
  boolean: ['local', 'firefox', 'watch', 'view-engine'],
  default: {watch: true, 'view-engine': false},
});

// Whether tests for all components should be run.
const all = components.length === 1 && components[0] === 'all';

// We can only run a single target with "--local". Running multiple targets within the
// same Karma server is not possible since each test target runs isolated from the others.
if (local && (components.length > 1 || all)) {
  console.error(chalk.red(
      'Unable to run multiple components tests in local mode. ' +
      'Only one component at a time can be run with "--local"'));
  process.exit(1);
}

const browserName = firefox ? 'firefox-local' : 'chromium-local';
const bazelBinary = `yarn -s ${watch ? 'ibazel' : 'bazel'}`;
const configFlag = viewEngine ? '--config=view-engine' : '';

// If `all` has been specified as component, we run tests for all components
// in the repository. The `--firefox` flag can be still specified.
if (all) {
  // `ibazel` doesn't allow us to filter tests and build targets as it only allows
  // a subset of Bazel flags to be passed through. We temporarily always use `bazel`
  // instead of ibazel until https://github.com/bazelbuild/bazel-watcher/pull/382 lands.
  if (watch) {
    console.warn(chalk.yellow('Unable to run all component tests in watch mode.'));
    console.warn(chalk.yellow('Tests will be run in non-watch mode..'));
  }
  shelljs.exec(
      `yarn -s bazel test --test_tag_filters=-e2e,browser:${browserName} ` +
      `--build_tag_filters=browser:${browserName} --build_tests_only ${configFlag} //src/...`);
  return;
}

// Exit if no component has been specified.
if (!components.length) {
  console.error(chalk.red(
      'No component specified. Please either specify individual components, or pass "all" ' +
      'in order to run tests for all components.'));
  console.info(chalk.yellow('Below are a few examples of how the script can be run:'));
  console.info(chalk.yellow(` - yarn test all`));
  console.info(chalk.yellow(` - yarn test cdk/overlay material/stepper`));
  console.info(chalk.yellow(` - yarn test button toolbar`));
  process.exit(1);
}

const bazelAction = local ? 'run' : 'test';
const testLabels = components
    .map(t => correctTypos(t))
    .map(t => `${getBazelPackageOfComponentName(t)}:${getTargetName(t)}`);

// Runs Bazel for the determined test labels.
shelljs.exec(`${bazelBinary} ${bazelAction} ${testLabels.join(' ')} ${configFlag}`);

/**
 * Gets the Bazel package label for the specified component name. Throws if
 * the component could not be resolved to a Bazel package.
 */
function getBazelPackageOfComponentName(name) {
  // Before guessing any Bazel package, we test if the name contains the
  // package name already. If so, we just use that for Bazel package.
  const targetName = convertPathToBazelLabel(name) ||
                     convertPathToBazelLabel(path.join(packagesDir, name));
  if (targetName !== null) {
    return targetName;
  }
  // If the name does not contain an explicit package name, we try guessing the
  // package name by walking through an ordered list of possible packages and checking
  // if a package contains a component with the given name. The first match will be used.
  for (let guessPackage of orderedGuessPackages) {
    const guessTargetName = convertPathToBazelLabel(path.join(packagesDir, guessPackage, name));
    if (guessTargetName !== null) {
      return guessTargetName;
    }
  }
  console.error(chalk.red(`Could not find test target for specified component: ` +
    `${chalk.yellow(name)}. Looked in packages: ${orderedGuessPackages.join(', ')}`));
  process.exit(1);
}

/** Converts a path to a Bazel label. */
function convertPathToBazelLabel(name) {
  if (shelljs.test('-d', name)) {
    return `//${convertPathToPosix(path.relative(projectDir, name))}`;
  }
  return null;
}

/** Correct common typos in a target name */
function correctTypos(target) {
  let correctedTarget = target;
  for (const [typo, correction] of commonTypos) {
    correctedTarget = correctedTarget.replace(typo, correction);
  }

  return correctedTarget;
}

/** Converts an arbitrary path to a Posix path. */
function convertPathToPosix(pathName) {
  return pathName.replace(/\\/g, '/');
}

/** Gets the name of the target that should be run. */
function getTargetName(packageName) {
  // Schematics don't have _local and browser targets.
  if (packageName && packageName.endsWith('schematics')) {
    return 'unit_tests';
  }

  return `unit_tests_${local ? 'local' : browserName}`;
}
