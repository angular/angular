
module.exports = function(config) {
  require('./karma-build.conf.js')(config);

  config.plugins.push(require('karma-jasmine'));
  config.frameworks.push('jasmine');
};
