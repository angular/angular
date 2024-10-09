/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {customLaunchers} from '../../../browser-providers.conf';
import {Browser} from '../browser';

import {SaucelabsDaemon} from './saucelabs-daemon';

const args = process.argv.slice(2);
const username = process.env['SAUCE_USERNAME'];
const accessKey = process.env['SAUCE_ACCESS_KEY'];
const tunnelIdentifier = process.env['SAUCE_TUNNEL_IDENTIFIER'];

if (!username || !accessKey) {
  throw Error('Please set the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` variables.');
}

if (!tunnelIdentifier) {
  throw Error('No tunnel set up. Please set the `SAUCE_TUNNEL_IDENTIFIER` variable.');
}

// First argument is the path to the sauce connect binary. This argument is templated into the bazel
// binary.
if (args.length < 1) {
  throw Error(`Path to the sauce connect binary expected as first argument`);
}
const sauceConnect = args[0];

// Second argument is the number of parallel browsers to start. This argument is user supplied and
// required.
if (args.length != 2) {
  throw Error(`Please specify the number of parallel browsers to start on the command line.`);
}
const parallelExecutions = parseInt(args[1]);
if (!parallelExecutions) {
  throw Error(`Please specify a non-zero number of parallel browsers to start.`);
}

// Start the daemon and launch the given browser
const daemon = new SaucelabsDaemon(
  username,
  accessKey,
  process.env['CIRCLE_BUILD_NUM']!,
  Object.values(customLaunchers) as Browser[],
  parallelExecutions,
  sauceConnect,
  {tunnelIdentifier},
);

if (args.includes('--connect')) {
  daemon.connectTunnel().catch((err) => {
    console.error(`Failed to connect to Saucelabs: ${err}`);
    process.exit(1);
  });
}
