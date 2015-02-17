// load traceur runtime as our tests are written in es6
require('traceur/bin/traceur-runtime.js');

var nodeUuid = require('node-uuid');
var benchpress = require('./dist/js/cjs/benchpress/benchpress');
var SeleniumWebDriverAdapter = require('./dist/js/cjs/benchpress/src/webdriver/selenium_webdriver_adapter').SeleniumWebDriverAdapter;
var cmdArgs = require('minimist')(process.argv);

var cmdLineBrowsers = cmdArgs.browsers ? cmdArgs.browsers.split(',') : [];

var config = exports.config = {
  // Disable waiting for Angular as we don't have an integration layer yet...
  // TODO(tbosch): Implement a proper debugging API for Ng2.0, remove this here
  // and the sleeps in all tests.
  onPrepare: function() {
    browser.ignoreSynchronization = true;
    var _get = browser.get;
    var sleepInterval = process.env.TRAVIS || process.env.JENKINS_URL ? 7000 : 3000;
    browser.get = function() {
      var result = _get.apply(this, arguments);
      browser.sleep(sleepInterval);
      return result;
    }
  },

  framework: 'jasmine2',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },
  params: {
    benchmark: {
      scaling: [{
        userAgent: /Android/, value: 0.125
      }]
    }
  }
};

exports.createBenchpressRunner = function(options) {
  // TODO(tbosch): add cloud reporter again (only when !options.test)
  // var cloudReporterConfig;
  // if (process.env.CLOUD_SECRET_PATH) {
  //   console.log('using cloud reporter!');
  //   cloudReporterConfig = {
  //     auth: require(process.env.CLOUD_SECRET_PATH),
  //     projectId: 'angular-perf',
  //     datasetId: 'benchmarks',
  //     tableId: 'ng2perf'
  //   };
  // }

  var runId = nodeUuid.v1();
  if (process.env.GIT_SHA) {
    runId = process.env.GIT_SHA + ' ' + runId;
  }
  var bindings = [
    benchpress.bind(benchpress.WebDriverAdapter).toFactory(
      function() { return new SeleniumWebDriverAdapter(global.browser); }, []
    ),
    benchpress.bind(benchpress.Options.FORCE_GC).toValue(options.forceGc),
    benchpress.bind(benchpress.Options.DEFAULT_DESCRIPTION).toValue({
      'lang': options.lang,
      'runId': runId
    })
  ];
  if (options.test) {
    bindings.push(benchpress.SizeValidator.BINDINGS);
    bindings.push(benchpress.bind(benchpress.SizeValidator.SAMPLE_SIZE).toValue(1));
  } else {
    bindings.push(benchpress.RegressionSlopeValidator.BINDINGS);
    bindings.push(benchpress.bind(benchpress.RegressionSlopeValidator.SAMPLE_SIZE).toValue(options.sampleSize));
  }

  global.benchpressRunner = new benchpress.Runner(bindings);
}


var POSSIBLE_CAPS = {
  Dartium: {
    name: 'Dartium',
    browserName: 'chrome',
    chromeOptions: {
      'binary': process.env.DARTIUM,
      'args': ['--js-flags=--expose-gc']
    },
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  },
  ChromeDesktop: {
    browserName: 'chrome',
    chromeOptions: {
      'args': ['--js-flags=--expose-gc']
    },
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  },
  ChromeAndroid: {
    browserName: 'chrome',
    chromeOptions: {
      androidPackage: 'com.android.chrome',
      'args': ['--js-flags=--expose-gc']
    },
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
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
