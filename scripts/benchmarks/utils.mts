/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Log} from '@angular/ng-dev';
import childProcess from 'child_process';
import path from 'path';
import url from 'url';

const scriptDir = path.dirname(url.fileURLToPath(import.meta.url));

/** Absolute disk path to the project directory. */
export const projectDir: string = path.join(scriptDir, '../..');

/**
 * Executes the given command, forwarding stdin, stdout and stderr while
 * still capturing stdout in order to return it.
 */
export function exec(cmd: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    Log.info('Running command:', cmd, args.join(' '));

    const proc = childProcess.spawn(cmd, args, {
      shell: true,
      cwd: projectDir,
      // Only capture `stdout`. Forward the rest to the parent TTY.
      stdio: ['inherit', 'pipe', 'inherit'],
    });
    let stdout = '';

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
      process.stdout.write(chunk);
    });

    proc.on('close', (status, signal) => {
      if (status !== 0 || signal !== null) {
        reject(`Command failed. Status code: ${status}. Signal: ${signal}`);
      }
      resolve(stdout);
    });

    proc.on('error', (err) => {
      reject(`Command failed: ${err}`);
    });
  });
}
