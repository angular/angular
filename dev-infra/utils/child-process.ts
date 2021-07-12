/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {spawn, SpawnOptions} from 'child_process';
import {debug, error} from './console';

/** Interface describing the options for spawning a process. */
export interface SpawnedProcessOptions extends Omit<SpawnOptions, 'stdio'> {
  /** Console output mode. Defaults to "enabled". */
  mode?: 'enabled'|'silent'|'on-error';
}

/** Interface describing the result of a spawned process. */
export interface SpawnedProcessResult {
  /** Captured stdout in string format. */
  stdout: string;
  /** Captured stderr in string format. */
  stderr: string;
}

/**
 * Spawns a given command with the specified arguments inside an interactive shell. All process
 * stdin, stdout and stderr output is printed to the current console.
 *
 * @returns a Promise resolving on success, and rejecting on command failure with the status code.
 */
export function spawnInteractiveCommand(
    command: string, args: string[], options: Omit<SpawnOptions, 'stdio'> = {}) {
  return new Promise<void>((resolve, reject) => {
    const commandText = `${command} ${args.join(' ')}`;
    debug(`Executing command: ${commandText}`);
    const childProcess = spawn(command, args, {...options, shell: true, stdio: 'inherit'});
    childProcess.on('exit', status => status === 0 ? resolve() : reject(status));
  });
}

/**
 * Spawns a given command with the specified arguments inside a shell. All process stdout
 * output is captured and returned as resolution on completion. Depending on the chosen
 * output mode, stdout/stderr output is also printed to the console, or only on error.
 *
 * @returns a Promise resolving with captured stdout and stderr on success. The promise
 *   rejects on command failure.
 */
export function spawnWithDebugOutput(
    command: string, args: string[],
    options: SpawnedProcessOptions = {}): Promise<SpawnedProcessResult> {
  return new Promise((resolve, reject) => {
    const commandText = `${command} ${args.join(' ')}`;
    const outputMode = options.mode;

    debug(`Executing command: ${commandText}`);

    const childProcess = spawn(command, args, {...options, shell: true, stdio: 'pipe'});
    let logOutput = '';
    let stdout = '';
    let stderr = '';

    // Capture the stdout separately so that it can be passed as resolve value.
    // This is useful if commands return parsable stdout.
    childProcess.stderr.on('data', message => {
      stderr += message;
      logOutput += message;
      // If console output is enabled, print the message directly to the stderr. Note that
      // we intentionally print all output to stderr as stdout should not be polluted.
      if (outputMode === undefined || outputMode === 'enabled') {
        process.stderr.write(message);
      }
    });

    childProcess.stdout.on('data', message => {
      stdout += message;
      logOutput += message;
      // If console output is enabled, print the message directly to the stderr. Note that
      // we intentionally print all output to stderr as stdout should not be polluted.
      if (outputMode === undefined || outputMode === 'enabled') {
        process.stderr.write(message);
      }
    });

    childProcess.on('exit', (status, signal) => {
      const exitDescription = status !== null ? `exit code "${status}"` : `signal "${signal}"`;
      const printFn = outputMode === 'on-error' ? error : debug;

      printFn(`Command "${commandText}" completed with ${exitDescription}.`);
      printFn(`Process output: \n${logOutput}`);

      // On success, resolve the promise. Otherwise reject with the captured stderr
      // and stdout log output if the output mode was set to `silent`.
      if (status === 0) {
        resolve({stdout, stderr});
      } else {
        reject(outputMode === 'silent' ? logOutput : undefined);
      }
    });
  });
}
