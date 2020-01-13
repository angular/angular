/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
'use strict';

const shell = require('shelljs');
const karmaBin = require.resolve('karma/bin/karma');
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const sauceService = runfiles.resolve(process.argv[2]);
process.argv = [
  process.argv[0],
  karmaBin,
  ...process.argv.splice(3),
];
try {
  console.error(`Setting up environment for SauceLabs karma tests...`);
  // KARMA_WEB_TEST_MODE is set which informs /karma-js.conf.js that it should
  // run the test with the karma saucelabs launcher
  process.env['KARMA_WEB_TEST_MODE'] = 'SL_REQUIRED';
  // Setup required SAUCE_* env if they are not already set
  if (!process.env['SAUCE_USERNAME'] || !process.env['SAUCE_ACCESS_KEY'] ||
      !process.env['SAUCE_TUNNEL_IDENTIFIER']) {
    try {
      // The following path comes from /tools/saucelabs/sauce-service.sh.
      // We setup the required saucelabs environment variables here for the karma test
      // from a json file under /tmp/angular/sauce-service  so that we don't break the
      // test cache with a changing SAUCE_TUNNEL_IDENTIFIER provided through --test_env
      const scParams = require('/tmp/angular/sauce-service/sauce-connect-params.json');
      process.env['SAUCE_USERNAME'] = scParams.SAUCE_USERNAME;
      process.env['SAUCE_ACCESS_KEY'] = scParams.SAUCE_ACCESS_KEY;
      process.env['SAUCE_TUNNEL_IDENTIFIER'] = scParams.SAUCE_TUNNEL_IDENTIFIER;
    } catch (e) {
      console.error(e.stack || e);
      console.error(
          `!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!! Make sure that you have run "yarn bazel run //tools/saucelabs:sauce_service_setup"
!!! (or "./tools/saucelabs/sauce-service.sh setup") before the test target. Alternately
!!! you can provide the required SAUCE_* environment variables (SAUCE_USERNAME, SAUCE_ACCESS_KEY &
!!! SAUCE_TUNNEL_IDENTIFIER) to the test with --test_env or --define but this may prevent bazel from
!!! using cached test results.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
      process.exit(1);
    }
  }

  const scStart = `${sauceService} start-ready-wait`;
  console.error(`Starting SauceConnect (${scStart})...`);
  const result = shell.exec(scStart).code;
  if (result !== 0) {
    throw new Error(`Starting SauceConnect failed with code ${result}`);
  }

  console.error(`Launching karma ${karmaBin}...`);
  module.constructor._load(karmaBin, this, /*isMain=*/true);
} catch (e) {
  console.error(e.stack || e);
  process.exit(1);
}
