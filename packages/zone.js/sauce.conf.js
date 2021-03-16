// Sauce configuration
const browserProvidersConf = require('../../browser-providers.conf');

module.exports = function(config, ignoredLaunchers) {
  // The WS server is not available with Sauce
  config.files.unshift('test/saucelabs.js');
  config.set({
    captureTimeout: 180000,
    browserDisconnectTimeout: 180000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 300000,
    sauceLabs: {
      testName: 'Zone.js',
      retryLimit: 3,
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      idleTimeout: 600,
      commandTimeout: 600,
      maxDuration: 5400,
    },

    customLaunchers: browserProvidersConf.customLaunchers,

    browsers: browserProvidersConf.sauceAliases.CI_REQUIRED,

    reporters: ['dots', 'saucelabs'],

    singleRun: true,
    transports: ['websocket', 'polling'],
    // plugins: ['karma-*']
  });

  if (process.env.TRAVIS) {
    config.sauceLabs.build =
        'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
    config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;

    process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');
  }

  if (process.env.SAUCE_LOCALHOST_ALIAS_DOMAIN) {
    config.hostname = process.env.SAUCE_LOCALHOST_ALIAS_DOMAIN;
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
