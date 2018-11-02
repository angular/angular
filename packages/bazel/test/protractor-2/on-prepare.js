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
  if (!global.userOnPrepareGotCalled) {
    throw new Error('Expecting user configuration onPrepare to have been called');
  }
  const portFlag = config.server.endsWith('prodserver') ? '-p' : '-port';
  return protractorUtils.runServer(config.workspace, config.server, portFlag, [])
      .then(serverSpec => {
        const serverUrl = `http://localhost:${serverSpec.port}`;
        protractor.browser.baseUrl = serverUrl;
      });
};
