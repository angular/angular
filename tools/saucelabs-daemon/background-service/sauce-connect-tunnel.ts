/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Establishes the Saucelabs connect tunnel.
 **/
export async function openSauceConnectTunnel(tunnelIdentifier: string, sauceConnect: string) {
  console.debug('Starting sauce connect tunnel...');

  const tmpFolder = await fs.mkdtemp('saucelabs-daemon-');

  await new Promise<void>((resolve, reject) => {
    // First we need to start the sauce connect tunnel
    const sauceConnectArgs = [
      '--readyfile',
      `${tmpFolder}/readyfile`,
      '--pidfile',
      `${tmpFolder}/pidfile`,
      '--tunnel-identifier',
      tunnelIdentifier || path.basename(tmpFolder),
    ];
    const sc = spawn(sauceConnect, sauceConnectArgs);

    sc.stdout!.on('data', (data) => {
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
