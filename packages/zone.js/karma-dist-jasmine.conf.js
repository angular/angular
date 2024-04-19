module.exports = function (config) {
  require('./karma-dist.conf.js')(config);

  config.plugins.push(require('karma-jasmine'));
  config.frameworks.push('jasmine');
};
