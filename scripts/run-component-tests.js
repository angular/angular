#!/usr/bin/env node

/**
 * Script that simplifies the workflow of running unit tests for a component
 * using Bazel. Here are a few examples:
 *
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

// ShellJS should exit if any command fails.
shelljs.set('-e');
shelljs.cd(projectDir);

// Extracts the supported command line options.
const {_: components, local, firefox, watch} = minimist(args, {
  boolean: ['local', 'firefox', 'watch'],
  default: {watch: true},
});

// Exit if no component has been specified.
if (!components.length) {
  console.error(chalk.red(
      'No component specified. Specify a component name, or pass a ' +
      'path to the component directory.'));
  process.exit(1);
}

// We can only run a single target with "--local". Running multiple targets within the
// same Karma server is not possible since each test target runs isolated from the others.
if (local && components.length > 1) {
  console.error(chalk.red(
      'Unable to run multiple components tests in local mode. ' +
      'Only one component at a time can be run with "--local"'));
  process.exit(1);
}

const bazelBinary = watch ? 'ibazel' : 'bazel';
const bazelAction = local ? 'run' : 'test';
const testTargetName =
    `unit_tests_${local ? 'local' : firefox ? 'firefox-local' : 'chromium-local'}`;
const testLabels = components.map(t => `${getBazelPackageOfComponentName(t)}:${testTargetName}`);

// Runs Bazel for the determined test labels.
shelljs.exec(`yarn -s ${bazelBinary} ${bazelAction} ${testLabels.join(' ')}`);

/**
 * Gets the Bazel package label for the specified component name. Throws if
 * the component could not be resolved to a Bazel package.
 */
function getBazelPackageOfComponentName(name) {
  // Before guessing any Bazel package, we test if the name contains the
  // package name already. If so, we just use that for Bazel package.
  const targetName = convertPathToBazelLabel(name);
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
  throw Error(chalk.red(`Could not find test target for specified component: ` +
    `${chalk.yellow(name)}. Looked in packages: ${orderedGuessPackages.join(', ')}`));
}

/** Converts a path to a Bazel label. */
function convertPathToBazelLabel(name) {
  if (shelljs.test('-d', name)) {
    return `//${convertPathToPosix(path.relative(projectDir, name))}`;
  }
  return null;
}

/** Converts an arbitrary path to a Posix path. */
function convertPathToPosix(pathName) {
  return pathName.replace(/\\/g, '/');
}
