// Sauce configuration

module.exports = function(config, ignoredLaunchers) {
  // The WS server is not available with Sauce
  config.files.unshift('test/saucelabs.js');

  var basicLaunchers = {
    'SL_CHROME': {base: 'SauceLabs', browserName: 'chrome', version: '48'},
    'SL_CHROME_65': {base: 'SauceLabs', browserName: 'chrome', version: '60'},
    'SL_FIREFOX': {base: 'SauceLabs', browserName: 'firefox', version: '52'},
    'SL_FIREFOX_59': {base: 'SauceLabs', browserName: 'firefox', version: '54'},
    /*'SL_SAFARI7': {
      base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.9',
        version: '7.0'
    },*/
    //'SL_SAFARI8':
    //    {base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.10', version: '8.0'},
    'SL_SAFARI9':
        {base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.11', version: '9.0'},
    'SL_SAFARI10':
        {base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.11', version: '10.0'},
    /*
     no longer supported in SauceLabs
    'SL_IOS7': {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.10',
      version: '7.1'
    },*/
    /*'SL_IOS8': {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.10',
      version: '8.4'
    },*/
    // 'SL_IOS9': {base: 'SauceLabs', browserName: 'iphone', platform: 'OS X 10.10', version:
    // '9.3'},
    'SL_IOS10': {base: 'SauceLabs', browserName: 'iphone', platform: 'OS X 10.10', version: '10.3'},
    'SL_IE11': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: '11'
    },
    'SL_MSEDGE': {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: '14.14393'
    },
    'SL_MSEDGE15': {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: '15.15063'
    },
    /*
     fix issue #584, Android 4.1~4.3 are not supported
    'SL_ANDROID4.1': {
      base: 'SauceLabs',
      browserName: 'android',
      platform: 'Linux',
      version: '4.1'
    },
    'SL_ANDROID4.2': {
      base: 'SauceLabs',
      browserName: 'android',
      platform: 'Linux',
      version: '4.2'
    },
    'SL_ANDROID4.3': {
      base: 'SauceLabs',
      browserName: 'android',
      platform: 'Linux',
      version: '4.3'
    },*/
    // 'SL_ANDROID4.4': {base: 'SauceLabs', browserName: 'android', platform: 'Linux', version:
    // '4.4'},
    'SL_ANDROID5.1': {base: 'SauceLabs', browserName: 'android', platform: 'Linux', version: '5.1'},
    'SL_ANDROID6.0': {base: 'SauceLabs', browserName: 'android', platform: 'Linux', version: '6.0'},
    'SL_ANDROID8.0': {
      base: 'SauceLabs',
      browserName: 'Chrome',
      appiumVersion: '1.12.1',
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
        'selenium-version': '2.53.0',
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
