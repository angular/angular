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

export function runServer(
    workspace: string, binary: string, portFlag: string, args: string[],
    timeout = 5000): Promise<ServerSpec> {
  return findFreeTcpPort().then(function(port) {
    const runfiles_path = process.env.TEST_SRCDIR;
    const cmd = path.join(runfiles_path, workspace, binary);

    args = args.concat([portFlag, port.toString()]);

    const child = child_process.spawn(
        cmd, args, {cwd: path.join(runfiles_path, workspace), stdio: 'inherit'});

    child.on('exit', function(code) {
      if (code != 0) {
        throw new Error(`non-zero exit code ${code} from server`);
      }
    });

    return waitForServer(port, timeout).then(() => { return {port}; });
  });
}
