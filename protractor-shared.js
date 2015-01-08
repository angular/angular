// load traceur runtime as our tests are written in es6
require('traceur/bin/traceur-runtime.js');
var cmdArgs = require('minimist')(process.argv);
var cmdLineBrowsers = cmdArgs.browsers ? cmdArgs.browsers.split(',') : [];

var config = exports.config = {
  // Disable waiting for Angular as we don't have an integration layer yet...
  // TODO(tbosch): Implement a proper debugging API for Ng2.0, remove this here
  // and the sleeps in all tests.
  onPrepare: function() {
    browser.ignoreSynchronization = true;
    var _get = browser.get;
    var sleepInterval = process.env.TRAVIS || process.env.JENKINS_URL ? 5000 : 2000;
    browser.get = function() {
      var result = _get.apply(this, arguments);
      browser.sleep(sleepInterval);
      return result;
    }
  },

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};

var POSSIBLE_CAPS = {
  Dartium: {
    name: 'Dartium',
    browserName: 'chrome',
    chromeOptions: {
      'binary': process.env.DARTIUM,
      'args': ['--js-flags=--expose-gc']
    },
    loggingPrefs: {
      performance: 'ALL'
    }
  },
  ChromeDesktop: {
    browserName: 'chrome',
    chromeOptions: {
      'args': ['--js-flags=--expose-gc']
    },
    loggingPrefs: {
      performance: 'ALL'
    }
  },
  ChromeAndroid: {
    browserName: 'chrome',
    chromeOptions: {
      androidPackage: 'com.android.chrome',
      'args': ['--js-flags=--expose-gc']
    },
    loggingPrefs: {
      performance: 'ALL'
    }
  }
};
if (cmdLineBrowsers.length) {
  config.multiCapabilities = cmdLineBrowsers.map(function(browserName) {
    var caps = POSSIBLE_CAPS[browserName];
    if (!caps) {
      throw new Error('Not configured browser name: '+browserName);
    }
    return caps;
  });
} else {
  config.multiCapabilities = [POSSIBLE_CAPS.ChromeDesktop];
}