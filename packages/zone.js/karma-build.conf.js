/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = function(config) {
  require('./karma-base.conf.js')(config);
  config.files.splice(
      -1, 0, 'build/test/browser-env-setup.js', 'build/test/wtf_mock.js',
      'build/test/test_fake_polyfill.js', 'build/lib/zone.js', 'build/lib/common/promise.js',
      'build/test/main.js', 'build/test/main.saucelab.js');
};
