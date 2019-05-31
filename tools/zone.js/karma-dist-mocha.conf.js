
module.exports = function(config) {
  require('./karma-dist.conf.js')(config);

  for (let i = 0; i < config.files.length; i++) {
    if (config.files[i] === 'dist/zone-testing.js') {
      config.files.splice(i, 1);
      break;
    }
  }
  config.files.push('dist/long-stack-trace-zone.js');
  config.files.push('dist/proxy.js');
  config.files.push('dist/sync-test.js');
  config.files.push('dist/async-test.js');
  config.files.push('dist/fake-async-test.js');
  config.files.push('dist/zone-patch-promise-test.js');
  config.plugins.push(require('karma-mocha'));
  config.frameworks.push('mocha');
  config.client.mocha = {
    timeout: 5000  // copied timeout for Jasmine in WebSocket.spec (otherwise Mochas default timeout
                   // at 2 sec is to low for the tests)
  };
};
