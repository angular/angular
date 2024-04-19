/**
 * Usage:
 *   node scripts/check-environment
 *
 * Checks that the expected Node and yarn versions are installed.
 *
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !!!                                                                                   !!!
 * !!!  This file is special in that it must be able to execute with wrong Node version  !!!
 * !!!  or even when node_modules are missing.                                           !!!
 * !!!                                                                                   !!!
 * !!!  Do not depend on Node4+ features or presence of npm packages here.               !!!
 * !!!                                                                                   !!!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * This is a slightly simplified, trimmed-down version of
 * [tools/check-environment.js](https://github.com/gkalpak/angular/blob/3896c60be/tools/check-environment.js).
 * We use a different file, because some of the tests and error messages are not relevant for `aio/`.
 */


'use strict';

var exec = require('child_process').exec;
var engines = require(__dirname + '/../package.json').engines;
var semver;

// Import `semver`.
try {
  semver = require('semver');
} catch (e) {
  reportIssues(['You are missing some npm dependencies. Run: yarn install']);
  console.error(
      'Your environment doesn\'t provide the prerequisite dependencies.\n' +
      'Please fix the issues listed above and then rerun the command.\n' +
      'Check out https://github.com/angular/angular/blob/main/aio/README.md for more info.');
  process.exit(1);
}

// Check Node/yarn versions.
checkEnvironment({
  nodeVersion: engines.node,
  yarnVersion: engines.yarn
});

// Helpers
function checkEnvironment(expected) {
  exec('yarn --version', function(yarnErr, yarnStdout) {
    var actualNodeVersion = process.version;
    var actualYarnVersion = !yarnErr && semver.clean(yarnStdout);
    var issues = [];

    // Check Node version.
    if (!semver.satisfies(actualNodeVersion, expected.nodeVersion)) {
      issues.push(
          'You are running an unsupported Node version. Expected: ' + expected.nodeVersion +
          ' Found: ' + actualNodeVersion + '. Use nvm to update your Node version.');
    }

    // Check yarn version.
    if (yarnErr) {
      issues.push(
          'You don\'t have yarn globally installed. This is required if you want to work on this ' +
          'project. Installation instructions: https://yarnpkg.com/lang/en/docs/install/');
    } else if (!semver.satisfies(actualYarnVersion, expected.yarnVersion)) {
      issues.push(
          'You are running an unsupported yarn version. Expected: ' + expected.yarnVersion +
          ' Found: ' + actualYarnVersion + '. For instructions see:' +
          ' https://yarnpkg.com/lang/en/docs/install/');
    }

    reportIssues(issues);
  });
}

function reportIssues(issues) {
  if (!issues.length) return;

  console.warn('');
  console.warn('!'.repeat(110));
  console.warn('!!!  Your environment is not in a good shape. The following issues were found:');
  issues.forEach(function(issue) { console.warn('!!!   - ' + issue); });
  console.warn('!'.repeat(110));
  console.warn('');

  if (process.env.CI) {
    process.exit(1);
  }
}
