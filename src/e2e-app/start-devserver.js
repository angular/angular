const protractor = require('protractor');

// Note: We need to specify an explicit file extension here because otherwise
// the Bazel-patched NodeJS module resolution would resolve to the `.mjs` file
// in non-sandbox environments (as usually with Bazel and Windows).
const utils = require('@bazel/protractor/protractor-utils.js');

/**
 * Called by Protractor before starting any tests. This is script is responsible for
 * starting up the devserver and updating the Protractor base URL to the proper port.
 */
module.exports = async function (config) {
  const {port} = await utils.runServer(config.workspace, config.server, '--port', []);
  const baseUrl = `http://localhost:${port}`;
  const processedConfig = await protractor.browser.getProcessedConfig();

  // Update the protractor "baseUrl" to match the new random TCP port. We need random TCP ports
  // because otherwise Bazel could not execute protractor tests concurrently.
  protractor.browser.baseUrl = baseUrl;
  processedConfig.baseUrl = baseUrl;
};
