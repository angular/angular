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
  const {port} = await protractorUtils.runServer(config.workspace, config.server, '-port', []);
  const processedConfig = await protractor.browser.getProcessedConfig();
  const serverUrl = `http://localhost:${port}`;

  return processedConfig.baseUrl = protractor.browser.baseUrl = serverUrl;
};
