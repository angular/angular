/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as child_process from 'child_process';
import * as net from 'net';
import * as path from 'path';

export function isTcpPortFree(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', (e) => { resolve(false); });
    server.on('close', () => { resolve(true); });
    server.listen(port, () => { server.close(); });
  });
}

export function isTcpPortBound(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.once('connect', () => { resolve(true); });
    client.once('error', (e) => { resolve(false); });
    client.connect(port);
  });
}

export async function findFreeTcpPort(): Promise<number> {
  const range = {
    min: 32768,
    max: 60000,
  };
  for (let i = 0; i < 100; i++) {
    let port = Math.floor(Math.random() * (range.max - range.min) + range.min);
    if (await isTcpPortFree(port)) {
      return port;
    }
  }
  throw new Error('Unable to find a free port');
}

// Interface for config parameter of the protractor_web_test_suite onPrepare function
export interface OnPrepareConfig {
  // The workspace name
  workspace: string;

  // The server binary to run
  server: string;
}

export function waitForServer(port: number, timeout: number): Promise<boolean> {
  return isTcpPortBound(port).then(isBound => {
    if (!isBound) {
      if (timeout <= 0) {
        throw new Error('Timeout waiting for server to start');
      }
      const wait = Math.min(timeout, 500);
      return new Promise((res, rej) => setTimeout(res, wait))
          .then(() => waitForServer(port, timeout - wait));
    }
    return true;
  });
}

// Return type from runServer function
export interface ServerSpec {
  // Port number that the server is running on
  port: number;
}

/**
 * Runs the specified server binary from a given workspace and waits for the server
 * being ready. The server binary will be resolved from the Bazel runfiles. Note that
 * the server will be launched with a random free port in order to support test concurrency
 * with Bazel.
 */
export async function runServer(
    workspace: string, serverTarget: string, portFlag: string, serverArgs: string[],
    timeout = 5000): Promise<ServerSpec> {
  const serverPath = require.resolve(`${workspace}/${serverTarget}`);
  const port = await findFreeTcpPort();

  // Start the Bazel server binary with a random free TCP port.
  const serverProcess = child_process.spawn(
      serverPath, serverArgs.concat([portFlag, port.toString()]), {stdio: 'inherit'});

  // In case the process exited with an error, we want to propagate the error.
  serverProcess.on('exit', exitCode => {
    if (exitCode !== 0) {
      throw new Error(`Server exited with error code: ${exitCode}`);
    }
  });

  // Wait for the server to be bound to the given port.
  await waitForServer(port, timeout);

  return {port};
}
