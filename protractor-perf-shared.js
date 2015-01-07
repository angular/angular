// load traceur runtime as our tests are written in es6
require('traceur/bin/traceur-runtime.js');

var config = exports.config = {

  specs: ['dist/cjs/**/*_perf.js'],

  params: {
    benchmark: {
      // size of the sample to take
      sampleSize: 10,
      targetCoefficientOfVariation: 4,
      timeout: 20000,
      metrics: ['script', 'render']
    }
  },

  // Disable waiting for Angular as we don't have an integration layer yet...
  // TODO(tbosch): Implement a proper debugging API for Ng2.0, remove this here
  // and the sleeps in all tests.
  onPrepare: function() {
    browser.ignoreSynchronization = true;
    var _get = browser.get;
    var sleepInterval = process.env.TRAVIS ? 5000 : 1000;
    browser.get = function() {
      browser.sleep(sleepInterval);
      return _get.apply(this, arguments);
    }
  },

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};

// TODO: add real mobile devices via a cloud provider that supports appium
if (process.env.TRAVIS) {
  config.capabilities = {
    name: 'Dartium',
    browserName: 'chrome',
    chromeOptions: {
      'binary': process.env.DARTIUM,
      'args': ['--js-flags=--expose-gc']
    },
    loggingPrefs: {
      performance: 'ALL'
    }
  };
} else {
  config.capabilities = {
    browserName: 'chrome',
    chromeOptions: {
      'args': ['--js-flags=--expose-gc']
    },
    loggingPrefs: {
      performance: 'ALL'
    }
  };
}
