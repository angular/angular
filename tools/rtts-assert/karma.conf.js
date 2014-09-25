var sharedConfig = require('pipe/karma');

module.exports = function(config) {
  sharedConfig(config);

  config.set({
    // list of files / patterns to load in the browser
    files: [
      'test-main.js',

      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/**/*.js', included: false}
    ],

    usePolling: true,

    preprocessors: {
      'src/**/*.js': ['traceur'],
      'test/**/*.js': ['traceur']
    }
  });

  config.sauceLabs.testName = 'assert';
};
