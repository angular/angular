/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const protractorUtils = require('@angular/bazel/protractor-utils');
const protractor = require('protractor');

module.exports = function(config) {
  return protractorUtils.runServer(config.workspace, config.server, '-port', [])
      .then(serverSpec => {
        const serverUrl = `http://localhost:${serverSpec.port}`;
        // Since the browser restarts in this benchmark we need to set both the browser.baseUrl
        // for the first test and the protractor config.baseUrl for the subsequent tests
        protractor.browser.baseUrl = serverUrl;
        return protractor.browser.getProcessedConfig().then((config) => config.baseUrl = serverUrl);
      });
};
