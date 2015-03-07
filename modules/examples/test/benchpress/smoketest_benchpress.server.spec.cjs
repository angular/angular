/**
 * Note: requires chromedriver to be in the current path before executing.
 * see https://sites.google.com/a/chromium.org/chromedriver/home
 **/

var benchpress = require('benchpress');
var WebDriverAdapter = benchpress.WebDriverAdapter;
var webdriver = require('selenium-webdriver');
var WebDriver = webdriver.WebDriver;
var By = webdriver.By
var SeleniumWebDriverAdapter = require('benchpress/src/webdriver/selenium_webdriver_adapter').SeleniumWebDriverAdapter;
var driver;
var runner;
var originalTimeout;

describe('benchpress', function () {
  beforeEach(function (done) {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30 * 1000;
    driver = require('selenium-webdriver/chrome').createDriver({
      browserName: 'chrome',
      chromeOptions: {
        'args': ['--js-flags=--expose-gc'],
        'perfLoggingPrefs': {
          'traceCategories': 'blink.console,disabled-by-default-devtools.timeline'
        }
      },
      loggingPrefs: {
        performance: 'ALL'
      }
    });
    runner = new benchpress.Runner([
      benchpress.bind(benchpress.WebDriverAdapter).toFactory(
        function() { return new SeleniumWebDriverAdapter(driver); }, []
      ),
      benchpress.bind(benchpress.Options.DEFAULT_DESCRIPTION).toValue({'table':'basic'})
    ]);

    done();
  });

  afterEach(function (done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    driver.close().then(done);
  });

  it('should work', function (done) {
    driver.get('http://localhost:8000/examples/src/benchpress/index.html');
    return runner.sample({
      id: 'benchpress smoke test',
      execute: function () {
        driver.findElement(By.tagName('button')).then(function(button) {
          console.log('clicking button')
          return button.click();
        }).
        then(function() {
          return driver.findElement(By.id('log'));
        }).
        then(function(el) {
          return el.getText();
        }).
        then(function(logText) {
          expect(logText).toBe('hi');
        });
      }
    }).then(done, done.fail);
  });
});
