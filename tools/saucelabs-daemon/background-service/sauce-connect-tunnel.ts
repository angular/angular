/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Establishes the Saucelabs connect tunnel.
 **/
export async function openSauceConnectTunnel(tunnelName: string, sauceConnect: string) {
  console.debug('Starting sauce connect tunnel...');
  console.debug('Using tunnel name:', tunnelName);

  const tmpFolder = await fs.mkdtemp('saucelabs-daemon-');

  await new Promise<void>((resolve, reject) => {
    // First we need to start the sauce connect tunnel
    const sauceConnectArgs = [
      '--readyfile',
      `${tmpFolder}/readyfile`,
      '--pidfile',
      `${tmpFolder}/pidfile`,
      '--tunnel-name',
      tunnelName,
    ];
    const sc = spawn(sauceConnect, sauceConnectArgs, {stdio: 'pipe'});

    sc.stderr.on('data', data => process.stderr.write(data));
    sc.stdout.on('data', (data) => {
      process.stdout.write(data);

      // If we see this message, we know the tunnel is ready.
      if (data.includes('Sauce Connect is up, you may start your tests.')) {
        resolve();
      }
    });

    sc.on('close', (code) => {
      reject(new Error(`sauce connect closed all stdio with code ${code}`));
    });

    sc.on('exit', (code) => {
      reject(new Error(`sauce connect exited with code ${code}`));
    });
  });

  console.debug('Starting sauce connect tunnel established');
}
