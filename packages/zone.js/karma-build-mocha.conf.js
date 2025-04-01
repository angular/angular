module.exports = function (config) {
  require('./karma-build.conf.js')(config);

  config.plugins.push(require('karma-mocha'));
  config.frameworks.push('mocha');
  config.client.mocha = {
    timeout: 5000, // copied timeout for Jasmine in WebSocket.spec (otherwise Mochas default timeout
    // at 2 sec is to low for the tests)
  };
};
