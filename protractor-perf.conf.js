// Make sure that the command line is read as the first thing
// as this could exit node if the help script should be printed.
require('./dist/all/e2e_util/perf_util').readCommandLine();

var CHROME_OPTIONS = {
  'args': ['--js-flags=--expose-gc', '--no-sandbox'],
  'perfLoggingPrefs': {
    'traceCategories': 'v8,blink.console,devtools.timeline,disabled-by-default-devtools.timeline'
  }
};

var BROWSER_CAPS = {
  LocalChrome: {
    'browserName': 'chrome',
    chromeOptions: CHROME_OPTIONS,
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  },
  ChromeOnTravis: {
    browserName: 'chrome',
    chromeOptions: mergeInto(CHROME_OPTIONS, {
      'binary': process.env.CHROME_BIN
    }),
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  }
};

exports.config = {
  onPrepare: function() {
    beforeEach(function() {
      browser.ignoreSynchronization = false;
    });
  },
  restartBrowserBetweenTests: true,
  allScriptsTimeout: 11000,
  specs: [
    'dist/all/**/e2e_test/**/*_perf.js'
  ],
  capabilities: process.env.TRAVIS ? BROWSER_CAPS.ChromeOnTravis : BROWSER_CAPS.LocalChrome,
  directConnect: true,
  baseUrl: 'http://localhost:8000/',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000,
    print: function(msg) { console.log(msg)}
  },
  useAllAngular2AppRoots: true
};

function mergeInto(src, target) {
for (var prop in src) {
  target[prop] = src[prop];
}
return target;
}
