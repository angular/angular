/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = function(config) {
  require('./karma-base.conf.js')(config);
  config.files.push('node_modules/core-js-bundle/index.js');
  config.files.push('build/test/browser-env-setup.js');
  config.files.push('build/test/wtf_mock.js');
  config.files.push('build/test/test_fake_polyfill.js');
  config.files.push('build/lib/zone.js');
  config.files.push('build/lib/common/promise.js');
  config.files.push('build/test/main.js');
};
