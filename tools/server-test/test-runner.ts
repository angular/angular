/**
 * A generic test runner for brining up a server on a random port, waiting for the server to bind
 * to that port, and then running tests against it.
 */

import * as child_process from 'child_process';
import * as net from 'net';
import {runfiles} from '@bazel/runfiles';

/** Checks if the given port is free. */
function isPortFree(port: number) {
  return new Promise<boolean>(resolve => {
    const server = net.createServer();
    server.on('error', () => resolve(false));
    server.on('close', () => resolve(true));
    server.listen(port, () => server.close());
  });
}

/** Checks if the given port is bound. */
function isPortBound(port: number) {
  return new Promise<boolean>(resolve => {
    const client = new net.Socket();
    client.once('connect', () => resolve(true));
    client.once('error', () => resolve(false));
    client.connect(port);
  });
}

/** Gets a random free port in the private port range. */
async function getRandomFreePort() {
  const minPrivatePort = 49152;
  const maxPrivatePort = 65535;
  let port: number;
  do {
    port = Math.floor(Math.random() * (maxPrivatePort - minPrivatePort + 1)) + minPrivatePort;
  } while (!(await isPortFree(port)));
  return port;
}

/** Returns a promise that resolves after the given number of ms. */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Returns a promise that resolves when the given port is bound, or rejects if it does not become
 * bound within the given timeout duration.
 */
async function waitForPortBound(port: number, timeout: number): Promise<boolean> {
  const isBound = await isPortBound(port);
  if (isBound) {
    return true;
  }
  if (timeout <= 0) {
    throw new Error('Timeout waiting for server to start');
  }
  const wait = Math.min(timeout, 500);
  return sleep(wait).then(() => waitForPortBound(port, timeout - wait));
}

/** Starts a server and runs a test against it. */
async function runTest(serverPath: string, testPath: string) {
  let server: child_process.ChildProcess | null = null;
  return new Promise<void>(async (resolve, reject) => {
    const port = await getRandomFreePort();

    // Expose the chosen test server port so that the test environment can
    // connect to the server.
    process.env['TEST_SERVER_PORT'] = `${port}`;

    // Start the server.
    server = child_process.spawn(serverPath, ['--port', `${port}`], {stdio: 'inherit'});
    server.on('exit', exitCode => {
      if (exitCode !== 0) {
        reject(Error(`Server exited with error code: ${exitCode}`));
      }
      server = null;
    });

    // Wait for the server to bind to the port, then run the tests.
    await waitForPortBound(port, 10000);

    const test = child_process.spawnSync(testPath, {stdio: 'inherit'});
    if (test.status === 0) {
      resolve();
    } else {
      reject(Error(`Test failed`));
    }
  }).finally(() => server?.kill());
}

if (require.main === module) {
  const [serverRootpath, testRootpath] = process.argv.slice(2);
  const serverBinPath = runfiles.resolveWorkspaceRelative(serverRootpath);
  const testBinPath = runfiles.resolveWorkspaceRelative(testRootpath);

  runTest(serverBinPath, testBinPath)
    .then(() => process.exit())
    .catch(() => process.exit(1));
}
