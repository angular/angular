/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = function(config) {
  require('./karma-base.conf.js')(config);
  config.files.push('build/test/browser-env-setup.js');
  config.files.push('build/test/wtf_mock.js');
  config.files.push('build/test/test_fake_polyfill.js');
  config.files.push('build/test/custom_error.js');
  config.files.push('dist/zone.js');
  config.files.push('dist/zone-patch-fetch.js');
  config.files.push('dist/zone-patch-canvas.js');
  config.files.push('dist/webapis-media-query.js');
  config.files.push('dist/webapis-notification.js');
  config.files.push('dist/zone-patch-user-media.js');
  config.files.push('dist/zone-patch-resize-observer.js');
  config.files.push('dist/task-tracking.js');
  config.files.push('dist/wtf.js');
  config.files.push('dist/zone-testing.js');
  config.files.push('build/test/main.js');
};
