// Make sure that the command line is read as the first thing
// as this could exit node if the help script should be printed.
require('./dist/all/e2e_util/e2e_util').readCommandLine();

var BROWSER_OPTIONS = {
  LocalChrome: {
    'browserName': 'chrome'
  },
  ChromeOnTravis: {
    browserName: 'chrome',
    chromeOptions: {
      'args': ['--no-sandbox'],
      'binary': process.env.CHROME_BIN
    }
  }
};

exports.config = {
  onPrepare: function() {
    beforeEach(function() {
      browser.ignoreSynchronization = false;
    });
  },
  allScriptsTimeout: 11000,
  specs: [
    'dist/examples/**/e2e_test/*_spec.js'
  ],
  capabilities: process.env.TRAVIS ? BROWSER_OPTIONS.ChromeOnTravis : BROWSER_OPTIONS.LocalChrome,
  directConnect: true,
  baseUrl: 'http://localhost:8001/',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000,
    print: function(msg) { console.log(msg)}
  },
  useAllAngular2AppRoots: true
};
