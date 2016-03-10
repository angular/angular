import 'dart:async';
import 'dart:io' show Platform;
import 'package:guinness/guinness.dart';
import 'package:benchpress/benchpress.dart';
import 'package:webdriver/webdriver.dart'
    show WebDriver, Capabilities, LogType, LogLevel, By;

/// Duration by which we increase the "fake page load" delay at each new attempt.
const _delayIncrementMillis = 50;

const _stableAngularName = 'angular.stable';
const _metricNames = const<String>[
  _stableAngularName,
  'angular.stable',
  'interactiveDom',
  'completeDom',
  'load'
];

main() {
  describe('benchpress', () {
    WebDriver driver;
    Runner runner;
    int pageLoadDelay;

    beforeEach(() async {
      driver = await createTestDriver();
      pageLoadDelay = 0;

      var bindings = [
        MultiMetric.createBindings([AngularLoadTimeMetric]),
        bind(RegressionSlopeValidator.METRIC).toValue(_stableAngularName),
        bind(WebDriverAdapter)
            .toFactory(() => new AsyncWebDriverAdapter(driver), [])
      ];
      runner = new Runner(bindings);
    });

    afterEach(() async {
      await for (var e in driver.logs.get('browser')) {
        print('LOG: $e');
      }
      await driver.close();
    });

    getPage({int angular}) async {
      await driver.get(
          'http://localhost:8002/playground/src/benchpress/fake_load_time.html'
          '?angular=${angular}&delay=${pageLoadDelay}');
    }

    checkMetrics(SampleState sample) {
      var stableValues = new Set<int>();
      for (MeasureValues values in sample.validSample) {
        for (String metric in _metricNames) {
          if (!values.values.containsKey(metric)) {
            throw new StateError(
                'Sample does not contain $metric in $values: $sample');
          }
        }
        stableValues.add(values.values[_stableAngularName]);
      }
      if (stableValues.length <= 1) {
        throw new StateError('Expected more than one value for $_stableAngularName, got $stableValues');
      }
    }

    // TODO(ochafik): Test difference with `driver.navigate.refresh()` for each browser.
    refresh() => driver.execute('window.location.reload(true /* forced */)', []);

    for (int version in [1, 2]) {
      it('should measure load time for fake angular$version', () async {
        // Throw away the first load, as Selenium might be installing its extension now.
        await getPage(angular: version);
        checkMetrics(await runner.sample(id: 'benchpress load time test fake angular$version',
            prepare: () async {
              // Introduce some noise in the loading time to ensure we're testing different samples
              // and make it easier to visualize the test's precision.
              // TODO(ochafik): Perform linear regression of collected samples and check the slope
              // and offsets are fine.
              pageLoadDelay += _delayIncrementMillis;
              await getPage(angular: version);
            },
            execute: refresh));
      });
    }

    it('should measure load time for angular2 hello world', () async {
      getPage() => driver.get('http://localhost:8002/playground/src/hello_world/index.html');

      await getPage();
      checkMetrics(await runner.sample(id: 'benchpress load time test angular2 hello world',
          prepare: () => getPage(),
          execute: refresh));
    });
  });
}

Future<WebDriver> createTestDriver() async {
  Map env = Platform.environment;
  var driver = await WebDriver.createDriver(desiredCapabilities: {
    'name': 'Dartium',
    'browserName': 'chrome',
    'chromeOptions': {
      'binary': env['DARTIUM_BIN']
    },
    'loggingPrefs': {'browser': 'ALL'}
  });
  driver.timeouts.setScriptTimeout(const Duration(seconds: 30));
  return driver;
}
