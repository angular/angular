// load traceur runtime as our tests are written in es6
require('traceur/bin/traceur-runtime.js');

var argv = require('yargs')
    .usage('Angular e2e/perf test options.')
    .options({
      'sample-size': {
        describe: 'sample size',
        default: 20,
        type: 'boolean'
      },
      'force-gc': {
        describe: 'force gc',
        default: false,
        type: 'boolean'
      },
      'benchmark': {
        describe: 'whether to run the benchmarks',
        default: false
      },
      'browsers': {
        describe: 'preconfigured browsers that should be used',
        default: 'ChromeDesktop'
      }
    })
    .help('ng-help')
    .wrap(40)
    .argv

var browsers = argv['browsers'].split(',');

var BROWSER_CAPS = {
  Dartium: {
    name: 'Dartium',
    browserName: 'chrome',
    chromeOptions: {
      'binary': process.env.DARTIUM,
      'args': ['--js-flags=--expose-gc'],
      'perfLoggingPrefs': {
        'traceCategories': 'blink.console,disabled-by-default-devtools.timeline'
      }
    },
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  },
  ChromeDesktop: {
    browserName: 'chrome',
    chromeOptions: {
      'args': ['--js-flags=--expose-gc'],
      'perfLoggingPrefs': {
        'traceCategories': 'blink.console,disabled-by-default-devtools.timeline'
      }
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
      'args': ['--js-flags=--expose-gc'],
      'perfLoggingPrefs': {
        'traceCategories': 'blink.console,disabled-by-default-devtools.timeline'
      }
    },
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  },
  IPhoneSimulator: {
    browserName: 'MobileSafari',
    simulator: true,
    CFBundleName: 'Safari',
    device: 'iphone',
    instruments: 'true',
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  },
  IPadNative: {
    browserName: 'MobileSafari',
    simulator: false,
    CFBundleName: 'Safari',
    device: 'ipad',
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL'
    }
  }
};

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

  specs: argv['benchmark'] ? [
    'dist/js/cjs/**/e2e_test/**/*_perf.js'
  ] : [
    'dist/js/cjs/**/e2e_test/**/*_spec.js',
    'dist/js/cjs/**/e2e_test/**/*_perf.js'
  ],

  exclude: [
    'dist/js/cjs/**/node_modules/**',
  ],

  multiCapabilities: browsers.map(function(browserName) {
    var caps = BROWSER_CAPS[browserName];
    console.log('Testing against', browserName);
    if (!caps) {
      throw new Error('Not configured browser name: '+browserName);
    }
    return caps;
  }),

  framework: 'jasmine2',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: argv.benchpress ? 80000 : 30000
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
  var nodeUuid = require('node-uuid');
  var benchpress = require('./dist/js/cjs/benchpress/benchpress');
  var SeleniumWebDriverAdapter =
    require('./dist/js/cjs/benchpress/src/webdriver/selenium_webdriver_adapter').SeleniumWebDriverAdapter;

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
    benchpress.bind(benchpress.Options.FORCE_GC).toValue(argv['force-gc']),
    benchpress.bind(benchpress.Options.DEFAULT_DESCRIPTION).toValue({
      'lang': options.lang,
      'runId': runId
    }),
    // TODO(tbosch): Make the ChromeDriverExtension configurable based on the
    // capabilities. Should support the case where we test against
    // ios and chrome at the same time!
    benchpress.bind(benchpress.WebDriverExtension).toFactory(function(adapter) {
      return new benchpress.ChromeDriverExtension(adapter);
    }, [benchpress.WebDriverAdapter])
  ];
  if (argv['benchmark']) {
    bindings.push(benchpress.RegressionSlopeValidator.BINDINGS);
    bindings.push(benchpress.bind(benchpress.RegressionSlopeValidator.SAMPLE_SIZE).toValue(argv['sample-size']));
  } else {
    bindings.push(benchpress.SizeValidator.BINDINGS);
    bindings.push(benchpress.bind(benchpress.SizeValidator.SAMPLE_SIZE).toValue(1));
  }

  global.benchpressRunner = new benchpress.Runner(bindings);
}
