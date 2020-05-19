/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const protractorUtils = require('@bazel/protractor/protractor-utils');
const protractor = require('protractor');

module.exports = async function(config) {
  const serverSpec = await protractorUtils.runServer(config.workspace, config.server, '-port', []);

  const serverUrl = `http://localhost:${serverSpec.port}`;
  // Since the browser restarts in this benchmark we need to set both the browser.baseUrl
  // for the first test and the protractor config.baseUrl for the subsequent tests
  protractor.browser.baseUrl = serverUrl;

  const processedConfig = await protractor.browser.getProcessedConfig();
  return processedConfig.baseUrl = serverUrl;
};
