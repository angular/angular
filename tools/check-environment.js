/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   !!!                                                                                   !!!
   !!!  This file is special in that it must be able to execute with wrong Node version  !!!
   !!!  or even when node_modules are missing.                                           !!!
   !!!                                                                                   !!!
   !!!  Do not depend on Node4+ features or presence of npm packages here.               !!!
   !!!                                                                                   !!!
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */

'use strict';

var exec = require('child_process').exec;
var checkNodeModules;
var semver;
var issues = [];

// coarse Node version check
if (+process.version[1] < 5) {
  issues.push('Angular build currently requires Node 5+. Use nvm to update your node version.');
}

try {
  semver = require('semver');
} catch (e) {
  issues.push('Looks like you are missing some npm dependencies. Run: npm install');
}

if (issues.length) {
  printWarning(issues);
  console.error(
      'Your environment doesn\'t provide the prerequisite dependencies.\n' +
      'Please fix the issues listed above and then rerun the gulp command.\n' +
      'Check out https://github.com/angular/angular/blob/master/DEVELOPER.md for more info.');
  process.exit(1);
}

// wrap in try/catch in case someone requires from within that file
try {
  checkNodeModules = require('./npm/check-node-modules.js');
} catch (e) {
  issues.push('Looks like you are missing some npm dependencies. Run: npm install');
  throw e;
} finally {
  // print warnings and move on, the next steps will likely fail, but hey, we warned them.
  printWarning(issues);
}

if (require.main === module) {
  // we are running this script directly so just run checkEnvironment against the main angular
  // package.json
  var engines = require(__dirname + '/../package.json').engines;
  checkEnvironment({
    requiredNodeVersion: engines.node,
    requiredNpmVersion: engines.npm,
    requiredYarnVersion: engines.yarn
  });
}

function checkEnvironment(reqs) {
  exec('npm --version', function(npmErr, npmStdout) {
    exec('yarn --version', function(yarnErr, yarnStdout) {
      var foundNodeVersion = process.version;
      var foundNpmVersion = semver.clean(npmStdout);
      var foundYarnVersion = !yarnErr && semver.clean(yarnStdout);
      var issues = [];


      if (!semver.satisfies(foundNodeVersion, reqs.requiredNodeVersion)) {
        issues.push(
            'You are running unsupported node version. Found: ' + foundNodeVersion + ' Expected: ' +
            reqs.requiredNodeVersion + '. Use nvm to update your node version.');
      }

      if (!semver.satisfies(foundNpmVersion, reqs.requiredNpmVersion)) {
        issues.push(
            'You are running unsupported npm version. Found: ' + foundNpmVersion + ' Expected: ' +
            reqs.requiredNpmVersion + '. Run: npm update -g npm');
      }

      if (yarnErr) {
        issues.push(
            'You don\'t have yarn globally installed. This is required if you want to work on ' +
            'certain areas, such as `aio/` and `integration/`. Installation instructions: ' +
            'https://yarnpkg.com/lang/en/docs/install/');
      } else if (!semver.satisfies(foundYarnVersion, reqs.requiredYarnVersion)) {
        issues.push(
            'You are running unsupported yarn version. Found: ' + foundYarnVersion + ' Expected: ' +
            reqs.requiredYarnVersion + '. This is required if you want to work on ' +
            'certain areas, such as `aio/` and `integration/`. See: ' +
            'https://yarnpkg.com/lang/en/docs/install/');
      }

      if (!checkNodeModules()) {
        issues.push(
            'Your node_modules directory is stale or out of sync with npm-shrinkwrap.json. Run: npm install');
      }

      printWarning(issues);
    })
  });
}

function printWarning(issues) {
  if (!issues.length) return;

  console.warn('');
  console.warn('!'.repeat(110));
  console.warn('!!!  Your environment is not in a good shape. Following issues were found:');
  issues.forEach(function(issue) { console.warn('!!!   - ' + issue); });
  console.warn('!'.repeat(110));
  console.warn('');

  if (process.env.CI) {
    process.exit(1);
  }
}


module.exports = checkEnvironment;
