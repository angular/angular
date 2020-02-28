
module.exports = function(config) {
  require('./karma-build.conf.js')(config);

  config.plugins.push(require('karma-jasmine'));
  config.plugins.push(require('karma-phantomjs-launcher'));
  config.frameworks.push('jasmine');
  config.browsers.splice(0, 1, ['PhantomJS']);
};
