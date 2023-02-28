
module.exports = function(config) {
  require('./karma-dist-jasmine.conf.js')(config);
  require('./sauce.es2015.conf')(config);
  config.files.push('build/test/wtf_mock.js');
  config.files.push('build/test/test_fake_polyfill.js');
  config.files.push('build/test/custom_error.js');
  config.files.push({pattern: 'dist/zone-evergreen.js', type: 'module'});
  config.files.push('dist/zone-patch-canvas.js');
  config.files.push('dist/zone-patch-fetch.js');
  config.files.push('dist/webapis-media-query.js');
  config.files.push('dist/webapis-notification.js');
  config.files.push('dist/zone-patch-user-media.js');
  config.files.push('dist/zone-patch-resize-observer.js');
  config.files.push('dist/task-tracking.js');
  config.files.push('dist/wtf.js');
  config.files.push('dist/zone-testing.js');
  config.files.push('build/test/test-env-setup-jasmine.js');
  config.files.push('build/lib/common/error-rewrite.js');
  config.files.push('build/test/browser/custom-element.spec.js');
};
