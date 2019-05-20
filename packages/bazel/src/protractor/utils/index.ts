/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as child_process from 'child_process';
import * as net from 'net';

const DEFAULT_TIMEOUT = 5000;

// By default use the set of ports 57 ports >= 2000 that work
// SauceLabs is able to proxy through SourceConnect for all
// browsers. See
// https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS#SauceConnectProxyFAQS-CanIAccessApplicationsonlocalhost?.
// The work-around for this limited set of ports in SauceLabs
// is to add an entry to /etc/hosts such as `127.0.0.1 localtestsite`
// on the machine running SauceConnect and use this hostname in protractor instead
// of localhost as some browsers restrict which localhost ports can be proxied.
const DEFAULT_PORTS = [
  2000, 2001, 2020, 2109, 2222, 2310, 3000, 3001, 3010, 3030, 3210,  3333, 4000, 4001, 4201,
  4040, 4321, 4502, 4503, 4567, 5000, 5001, 5002, 5050, 5555, 5432,  6000, 6001, 6060, 6666,
  6543, 7000, 7070, 7774, 7777, 8000, 8001, 8003, 8031, 8080, 8081,  8443, 8765, 8777, 8888,
  9000, 9001, 9031, 9080, 9081, 9090, 9191, 9876, 9877, 9999, 49221, 55001
];

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

export async function findFreeTcpPort(set?: number[]): Promise<number> {
  // Clone and shuffle the ports passed in
  const ports = (set ? set : DEFAULT_PORTS).slice(0).sort(() => Math.random() - 0.5);
  while (true) {
    if (!ports.length) {
      throw new Error('Unable to find a free port');
    }
    const port = ports.shift();
    if (await isTcpPortFree(port)) {
      return port;
    }
  }
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

export interface StartServerOptions {
  // The OnPrepareConfig config passed to the protractor
  // onPrepare function when using the `on_prepare` attribute
  // of protractor_web_test.
  config: OnPrepareConfig;

  // The flag to use for passing the port
  portFlag: string;

  // Additional server arguments
  serverArgs?: string[];

  // An array of ports to choose from.
  // Defaults to DEFAULT_PORTS if not set
  ports?: number[];

  // Timeout for the server to start
  // Defaults to DEFAULT_TIMEOUT if not set
  timeout?: number;
}

// Return type from startServer function
export interface ServerSpec {
  // Port number that the server is running on
  port: number;
}

/**
 * Legacy version of startServer
 */
export async function runServer(
    workspace: string, server: string, portFlag: string, serverArgs: string[],
    timeout = DEFAULT_TIMEOUT): Promise<ServerSpec> {
  const config: OnPrepareConfig = {workspace, server};
  return startServer({config, portFlag, serverArgs, timeout});
}

/**
 * Runs the specified server binary from a given workspace and waits for the server
 * being ready. The server binary will be resolved from the Bazel runfiles. Note that
 * the server will be launched with a random free port in order to support test concurrency
 * with Bazel.
 */
export async function startServer(options: StartServerOptions): Promise<ServerSpec> {
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const ports = options.ports || DEFAULT_PORTS;
  const serverArgs = options.serverArgs || [];

  const serverPath = require.resolve(`${options.config.workspace}/${options.config.server}`);
  const port = await findFreeTcpPort(ports);

  // Start the Bazel server binary with a random free TCP port.
  const serverProcess = child_process.spawn(
      serverPath, serverArgs.concat([options.portFlag, port.toString()]), {stdio: 'inherit'});

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
