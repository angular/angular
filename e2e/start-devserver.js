const protractor = require('protractor');
const utils = require('@angular/bazel/protractor-utils');
const spawn = require('child_process').spawn;

/**
 * Runs the specified server binary from a given workspace and waits for the server
 * being ready. The server binary will be resolved from the runfiles.
 */
async function runBazelServer(workspace, serverPath, timeout) {
  const serverBinary = require.resolve(`${workspace}/${serverPath}`);
  const port = await utils.findFreeTcpPort();

  // Start the Bazel server binary with a random free TCP port.
  const serverProcess = spawn(serverBinary, ['-port', port], {stdio: 'inherit'});

  // In case the process exited with an error, we want to propagate the error.
  serverProcess.on('exit', exitCode => {
    if (exitCode !== 0) {
      throw new Error(`Server exited with error code: ${exitCode}`);
    }
  });

  // Wait for the server to be bound to the given port.
  await utils.waitForServer(port, timeout);

  return port;
}

/**
 * Called by Protractor before starting any tests. This is script is responsible for
 * starting up the devserver and updating the Protractor base URL to the proper port.
 */
module.exports = async function(config) {
  const port = await runBazelServer(config.workspace, config.server);
  const baseUrl = `http://localhost:${port}`;
  const processedConfig = await protractor.browser.getProcessedConfig();

  // Update the protractor "baseUrl" to match the new random TCP port. We need random TCP ports
  // because otherwise Bazel could not execute protractor tests concurrently.
  protractor.browser.baseUrl = baseUrl;
  processedConfig.baseUrl = baseUrl;
};
