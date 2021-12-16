/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import minimist from 'minimist';

import {DevServer} from './dev-server';
import {setupBazelWatcherSupport} from './ibazel';

const args = process.argv.slice(2);
const {
  root_paths: _rootPathsRaw,
  port,
  historyApiFallback,
} = minimist(args, {boolean: 'historyApiFallback'});

const rootPaths = _rootPathsRaw ? _rootPathsRaw.split(',') : ['/'];

const bindUi = process.env.TEST_TARGET === undefined;
const server = new DevServer(port, rootPaths, bindUi, historyApiFallback);

// Setup ibazel support.
setupBazelWatcherSupport(server);

// Start the devserver. The server will always bind to the loopback and
// the public interface of the current host.
server.start();
