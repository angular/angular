/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createInterface} from 'readline';
import {DevServer} from './dev-server';

// ibazel will write this string after a successful build.
const ibazelNotifySuccessMessage = 'IBAZEL_BUILD_COMPLETED SUCCESS';

/**
 * Sets up ibazel support for the specified devserver. ibazel communicates with
 * an executable over the "stdin" interface. Whenever a specific message is sent
 * over "stdin", the devserver can be reloaded.
 */
export function setupBazelWatcherSupport(server: DevServer) {
  // ibazel communicates via the stdin interface.
  const rl = createInterface({input: process.stdin, terminal: false});

  rl.on('line', (chunk: string) => {
    if (chunk === ibazelNotifySuccessMessage) {
      server.reload();
    }
  });

  rl.on('close', () => {
    // Give ibazel 5s to kill this process, otherwise we exit the process manually.
    setTimeout(() => {
      console.error('ibazel failed to stop the devserver after 5s.');
      process.exit(1);
    }, 5000);
  });
}
