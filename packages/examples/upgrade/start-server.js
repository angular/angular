/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const protractorUtils = require('@angular/bazel/protractor-utils');
const protractor = require('protractor');

module.exports = async function(config) {
  const {port} = await protractorUtils.runServer(config.workspace, config.server, '-port', []);
  const serverUrl = `http://localhost:${port}`;

  protractor.browser.baseUrl = serverUrl;
};
