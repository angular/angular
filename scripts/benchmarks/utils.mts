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
 * Executes the given command with the provided arguments. Arguments are passed
 * as a discrete array to the child process, bypassing shell interpretation.
 * This ensures that special shell characters within arguments are treated as
 * literal values and cannot be used to inject additional commands.
 */
export function exec(cmd: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    Log.info('Running command:', cmd, args.join(' '));

    const proc = childProcess.spawn(cmd, args, {
      // Do not use a shell to spawn the process. This ensures that arguments
      // are passed directly to the executable without shell interpretation,
      // preventing injection via shell metacharacters.
      shell: false,
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
