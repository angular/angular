/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const shell = require('shelljs');
const karmaBin = require.resolve('karma/bin/karma');
const {runfiles} = require('@bazel/runfiles');
const sauceService = runfiles.resolveWorkspaceRelative(process.argv[2]);
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
  // Saucelabs parameters read from a temporary file that is created by the `sauce-service`. This
  // will be `null` if the test runs locally without the `sauce-service` being started.
  const saucelabsParams = readLocalSauceConnectParams();
  // Setup required SAUCE_* env if they are not already set
  if (!process.env['SAUCE_USERNAME'] || !process.env['SAUCE_ACCESS_KEY'] ||
      !process.env['SAUCE_TUNNEL_IDENTIFIER']) {
    // We print a helpful error message below if the required Saucelabs parameters have not
    // been specified in test environment, and the `sauce-service` params file has not been
    // created either.
    if (saucelabsParams === null) {
      console.error(`
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!! Make sure that you have run "yarn bazel run //tools/saucelabs:sauce_service_setup"
!!! (or "./tools/saucelabs/sauce-service.sh setup") before the test target. Alternately
!!! you can provide the required SAUCE_* environment variables (SAUCE_USERNAME, SAUCE_ACCESS_KEY &
!!! SAUCE_TUNNEL_IDENTIFIER) to the test with --test_env or --define but this may prevent bazel from
!!! using cached test results.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
      process.exit(1);
    }
    process.env['SAUCE_USERNAME'] = saucelabsParams.SAUCE_USERNAME;
    process.env['SAUCE_ACCESS_KEY'] = saucelabsParams.SAUCE_ACCESS_KEY;
    process.env['SAUCE_TUNNEL_IDENTIFIER'] = saucelabsParams.SAUCE_TUNNEL_IDENTIFIER;
    process.env['SAUCE_LOCALHOST_ALIAS_DOMAIN'] = saucelabsParams.SAUCE_LOCALHOST_ALIAS_DOMAIN;
  }

  // Pass through the optional `SAUCE_LOCALHOST_ALIAS_DOMAIN` environment variable. The
  // variable is usually specified on CI, but is not required for testing with Saucelabs.
  if (!process.env['SAUCE_LOCALHOST_ALIAS_DOMAIN'] && saucelabsParams !== null) {
    process.env['SAUCE_LOCALHOST_ALIAS_DOMAIN'] = saucelabsParams.SAUCE_LOCALHOST_ALIAS_DOMAIN;
  }

  const scStart = `${sauceService} start-ready-wait`;
  console.error(`Starting SauceConnect (${scStart})...`);
  const result = shell.exec(scStart).code;
  if (result !== 0) {
    throw new Error(`Starting SauceConnect failed with code ${result}`);
  }

  console.error(`Launching karma ${karmaBin}...`);
  module.constructor._load(karmaBin, this, /*isMain=*/ true);
} catch (e) {
  console.error(e.stack || e);
  process.exit(1);
}

function readLocalSauceConnectParams() {
  try {
    // The following path comes from /tools/saucelabs/sauce-service.sh.
    // We setup the required saucelabs environment variables here for the karma test
    // from a json file under /tmp/angular/sauce-service  so that we don't break the
    // test cache with a changing SAUCE_TUNNEL_IDENTIFIER provided through --test_env
    return require('/tmp/angular/sauce-service/sauce-connect-params.json');
  } catch {
    return null;
  }
}
