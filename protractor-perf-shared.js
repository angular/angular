// load traceur runtime as our tests are written in es6
require('traceur/bin/traceur-runtime.js');

var cloudReporterConfig;
try {
  cloudReporterConfig = require('./perf-cloud-secret.js');
} catch (e) {
  cloudReporterConfig = null;
}

var config = exports.config = {

  specs: ['dist/cjs/**/*_perf.js'],

  params: {
    benchmark: {
      // size of the sample to take
      sampleSize: 20,
      timeout: 20000,
      metrics: ['script', 'render', 'gcAmount', 'gcAmountInScript', 'gcTime'],
      // forces a gc after every run
      forceGc: false,
      reporters: [
        require('./dist/cjs/tools/benchpress/src/console_reporter.js'),
        cloudReporterConfig ? require('./dist/cjs/tools/benchpress/src/cloud_reporter.js') : null,
      ],
      cloudReporter: cloudReporterConfig
    }
  },

  // Disable waiting for Angular as we don't have an integration layer yet...
  // TODO(tbosch): Implement a proper debugging API for Ng2.0, remove this here
  // and the sleeps in all tests.
  onPrepare: function() {
    browser.ignoreSynchronization = true;
    var _get = browser.get;
    var sleepInterval = process.env.TRAVIS ? 5000 : 2000;
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
