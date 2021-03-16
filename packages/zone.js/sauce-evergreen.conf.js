// Sauce configuration

module.exports = function(config, ignoredLaunchers) {
  // The WS server is not available with Sauce
  config.files.unshift('test/saucelabs.js');

  var basicLaunchers = {
    'SL_CHROME': {base: 'SauceLabs', browserName: 'chrome', version: '72'},
    'SL_CHROME_60': {base: 'SauceLabs', browserName: 'chrome', version: '60'},
    'SL_ANDROID8.0': {
      base: 'SauceLabs',
      browserName: 'Chrome',
      appiumVersion: '1.9.1',
      platformName: 'Android',
      deviceName: 'Android GoogleAPI Emulator',
      platformVersion: '8.0'
    }
  };

  var customLaunchers = {};
  if (!ignoredLaunchers) {
    customLaunchers = basicLaunchers;
  } else {
    Object.keys(basicLaunchers).forEach(function(key) {
      if (ignoredLaunchers
              .filter(function(ignore) {
                return ignore === key;
              })
              .length === 0) {
        customLaunchers[key] = basicLaunchers[key];
      }
    });
  }

  config.set({
    captureTimeout: 120000,
    browserNoActivityTimeout: 240000,

    sauceLabs: {
      testName: 'Zone.js',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      options: {
        'selenium-version': '3.4.0',
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

  if (process.env['SAUCE_TUNNEL_IDENTIFIER']) {
    console.log(`SAUCE_TUNNEL_IDENTIFIER: ${process.env.SAUCE_TUNNEL_IDENTIFIER}`);

    const tunnelIdentifier = process.env['SAUCE_TUNNEL_IDENTIFIER'];

    // Setup the Saucelabs plugin so that it can launch browsers using the proper tunnel.
    config.sauceLabs.build = tunnelIdentifier;
    config.sauceLabs.tunnelIdentifier = tunnelIdentifier;

    // Setup the Browserstack plugin so that it can launch browsers using the proper tunnel.
    // TODO: This is currently not used because BS doesn't run on the CI. Consider removing.
    // config.browserStack.build = tunnelIdentifier;
    // config.browserStack.tunnelIdentifier = tunnelIdentifier;
  }
};
