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
      -1, 0, 'node_modules/core-js-bundle/index.js', 'build/test/browser-env-setup.js',
      'build/test/wtf_mock.js', 'build/test/test_fake_polyfill.js', 'dist/zone.js',
      'dist/zone-patch-fetch.js', 'dist/zone-patch-canvas.js', 'dist/webapis-media-query.js',
      'dist/webapis-notification.js', 'dist/zone-patch-user-media.js',
      'dist/zone-patch-message-port.js', 'dist/zone-patch-resize-observer.js',
      'dist/task-tracking.js', 'dist/wtf.js', 'dist/zone-testing.js',
      'build/test/main.saucelab.js');
};
