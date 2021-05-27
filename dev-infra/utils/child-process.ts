/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {spawn as _spawn, SpawnOptions as _SpawnOptions, spawnSync as _spawnSync, SpawnSyncOptions as _SpawnSyncOptions} from 'child_process';
import {debug, error} from './console';


/** Interface describing the options for spawning a process synchronously. */
export interface SpawnSyncOptions extends Omit<_SpawnSyncOptions, 'shell'|'stdio'> {
  /** Whether to prevent exit codes being treated as failures. */
  suppressErrorOnFailingExitCode?: boolean;
}

/** Interface describing the options for spawning a process. */
export interface SpawnOptions extends Omit<_SpawnOptions, 'shell'|'stdio'> {
  /** Console output mode. Defaults to "enabled". */
  mode?: 'enabled'|'silent'|'on-error';
  /** Whether to prevent exit codes being treated as failures. */
  suppressErrorOnFailingExitCode?: boolean;
}

/** Interface describing the options for spawning an interactive process. */
export type SpawnInteractiveCommandOptions = Omit<_SpawnOptions, 'shell'|'stdio'>;

/** Interface describing the result of a spawned process. */
export interface SpawnResult {
  /** Captured stdout in string format. */
  stdout: string;
  /** Captured stderr in string format. */
  stderr: string;
  /** The exit code or signal of the process. */
  status: number|NodeJS.Signals;
}

/**
 * Spawns a given command with the specified arguments inside an interactive shell. All process
 * stdin, stdout and stderr output is printed to the current console.
 *
 * @returns a Promise resolving on success, and rejecting on command failure with the status code.
 */
export function spawnInteractive(
    command: string, args: string[], options: SpawnInteractiveCommandOptions = {}) {
  return new Promise<void>((resolve, reject) => {
    const commandText = `${command} ${args.join(' ')}`;
    debug(`Executing command: ${commandText}`);
    const childProcess = _spawn(command, args, {...options, shell: true, stdio: 'inherit'});
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
export function spawn(
    command: string, args: string[], options: SpawnOptions = {}): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const commandText = `${command} ${args.join(' ')}`;
    const outputMode = options.mode;

    debug(`Executing command: ${commandText}`);

    const childProcess = _spawn(command, args, {...options, shell: true, stdio: 'pipe'});
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

    childProcess.on('exit', (exitCode, signal) => {
      const exitDescription = exitCode !== null ? `exit code "${exitCode}"` : `signal "${signal}"`;
      const printFn = outputMode === 'on-error' ? error : debug;
      const status = statusFromExitCodeAndSignal(exitCode, signal);

      printFn(`Command "${commandText}" completed with ${exitDescription}.`);
      printFn(`Process output: \n${logOutput}`);

      // On success, resolve the promise. Otherwise reject with the captured stderr
      // and stdout log output if the output mode was set to `silent`.
      if (status === 0 || options.suppressErrorOnFailingExitCode) {
        resolve({stdout, stderr, status});
      } else {
        reject(outputMode === 'silent' ? logOutput : undefined);
      }
    });
  });
}

/**
 * Spawns a given command with the specified arguments inside a shell synchronously.
 *
 * @returns The command's stdout and stderr.
 */
export function spawnSync(
    command: string, args: string[], options: SpawnSyncOptions = {}): SpawnResult {
  const commandText = `${command} ${args.join(' ')}`;
  debug(`Executing command: ${commandText}`);

  const {status: exitCode, signal, stdout, stderr} =
      _spawnSync(command, args, {...options, encoding: 'utf8', shell: true, stdio: 'pipe'});

  /** The status of the spawn result. */
  const status = statusFromExitCodeAndSignal(exitCode, signal);

  if (status === 0 || options.suppressErrorOnFailingExitCode) {
    return {status, stdout, stderr};
  }

  throw new Error(stderr);
}

/**
 * Convert the provided exitCode and signal to a single status code.
 *
 * During `exit` node provides either a `code` or `signal`, one of which is guaranteed to be
 * non-null.
 *
 * For more details see: https://nodejs.org/api/child_process.html#child_process_event_exit
 */
function statusFromExitCodeAndSignal(exitCode: number|null, signal: NodeJS.Signals|null) {
  return exitCode ?? signal ?? -1;
}
