// load traceur runtime as our tests are written in es6
require('traceur/bin/traceur-runtime.js');

var config = exports.config = {

  specs: ['dist/cjs/**/*_spec.js'],

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

if (process.env.TRAVIS) {
  config.capabilities = {
    name: 'Dartium',
    browserName: 'chrome',
    chromeOptions: {
      'binary': process.env.DARTIUM
    },
    loggingPrefs: {
      performance: 'ALL'
    }
  };
} else {
  config.capabilities = {
    browserName: 'chrome',
    loggingPrefs: {
      performance: 'ALL'
    }
  };
}
