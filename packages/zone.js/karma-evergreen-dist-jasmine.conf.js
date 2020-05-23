
module.exports = function(config) {
  require('./karma-evergreen-dist.conf.js')(config);

  config.plugins.push(require('karma-jasmine'));
  config.frameworks.push('jasmine');
};
