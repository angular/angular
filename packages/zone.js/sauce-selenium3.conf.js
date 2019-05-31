// Sauce configuration with Welenium drivers 3+

module.exports = function(config) {
  // The WS server is not available with Sauce
  config.files.unshift('test/saucelabs.js');

  var customLaunchers = {
    'SL_CHROME60':
        {base: 'SauceLabs', browserName: 'Chrome', platform: 'Windows 10', version: '60.0'},
    'SL_SAFARI11':
        {base: 'SauceLabs', browserName: 'safari', platform: 'macOS 10.13', version: '11.1'},
  };

  config.set({
    captureTimeout: 120000,
    browserNoActivityTimeout: 240000,

    sauceLabs: {
      testName: 'Zone.js',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      options: {
        'selenium-version': '3.5.0',
        'command-timeout': 600,
        'idle-timeout': 600,
        'max-duration': 5400
      }
    },

    customLaunchers: customLaunchers,

    browsers: Object.keys(customLaunchers),

    reporters: ['dots', 'saucelabs'],

    singleRun: true,

    plugins: ['karma-*']
  });

  if (process.env.TRAVIS) {
    config.sauceLabs.build =
        'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
    config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;

    process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');
  }
};
