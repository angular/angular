var benchpress = require('../../../tools/benchpress/index.js');
var webdriver = require('protractor/node_modules/selenium-webdriver');

module.exports = {
  runClickBenchmark: runClickBenchmark,
  verifyNoBrowserErrors: benchpress.verifyNoBrowserErrors
};

function runClickBenchmark(config) {
  var url = encodeURI(config.url + '?' + config.params.map(function(param) {
    return param.name + '=' + param.value;
  }).join('&'));
  browser.get(url);
  var buttons = config.buttons.map(function(selector) {
    return $(selector);
  });
  var benchmarkConfig = Object.create(browser.params.benchmark);
  benchmarkConfig.id = browser.params.lang+'.'+config.id;
  benchmarkConfig.params = config.params;
  benchpress.runBenchmark(benchmarkConfig, function() {
    buttons.forEach(function(button) {
      button.click();
    });
  });
}