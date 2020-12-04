/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fork} from 'child_process';
import {PassThrough} from 'stream';
import {BuiltPackage} from '../config/index';

/**
 * Builds the release output without polluting the process stdout. Build scripts commonly
 * print messages to stderr or stdout. This is fine in most cases, but sometimes other tooling
 * reserves stdout for data transfer. To not pollute the stdout in such cases, we launch a child
 * process for building the release packages and capture all stdout and stderr output to be used
 * if the child process exits with a non-zero exit code.
 */
export async function buildReleaseOutput(): Promise<BuiltPackage[]|null> {
  return new Promise((resolve, reject) => {
    /** A pass through stream to hold the combined content of the stderr and stdout `Readable`s. */
    const buildProcessTerminalOutput = new PassThrough();
    const buildProcess = fork(require.resolve('./build-worker'), [], {
      // The stdio option is set to redirect any "stdout" output directly to the "stderr" file
      // descriptor. An additional "ipc" file descriptor is created to support communication with
      // the build process. https://nodejs.org/api/child_process.html#child_process_options_stdio.
      stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
    });
    let builtPackages: BuiltPackage[]|null = null;

    // The child process will pass the `buildPackages()` output through the
    // IPC channel. We keep track of it so that we can use it as resolve value.
    buildProcess.on('message', buildResponse => builtPackages = buildResponse);

    // Pipe both the stderr and stdout streams into the pass through stream.  Both can be asserted
    // non-null as the stdio value used in fork for stdout and stderr is 'pipe' so they will be
    // defined.
    buildProcess.stdout!.pipe(buildProcess.stderr!.pipe(buildProcessTerminalOutput));

    // On child process exit, resolve the promise with the received output.
    buildProcess.on('exit', exitCode => {
      if (exitCode === 0) {
        resolve(builtPackages);
      } else {
        reject((buildProcessTerminalOutput.read() || '').toString());
      }
    });
  });
}
