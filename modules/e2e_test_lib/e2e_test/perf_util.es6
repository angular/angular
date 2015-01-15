var benchpress = require('../../../tools/benchpress/index.js');
var webdriver = require('protractor/node_modules/selenium-webdriver');

module.exports = {
  runClickBenchmark: runClickBenchmark,
  verifyNoBrowserErrors: benchpress.verifyNoBrowserErrors
};

function runClickBenchmark(config) {
  var globalParams = browser.params;
  getScaleFactor(globalParams.benchmark.scaling).then(function(scaleFactor) {
    var params = config.params.map(function(param) {
      return {
        name: param.name, value: applyScaleFactor(param.value, scaleFactor, param.scale)
      }
    });
    var benchmarkConfig = Object.create(globalParams.benchmark);
    benchmarkConfig.id = globalParams.lang+'.'+config.id;
    benchmarkConfig.params = params;
    benchmarkConfig.scaleFactor = scaleFactor;

    var url = encodeURI(config.url + '?' + params.map(function(param) {
      return param.name + '=' + param.value;
    }).join('&'));
    browser.get(url);
    var buttons = config.buttons.map(function(selector) {
      return $(selector);
    });
    benchpress.runBenchmark(benchmarkConfig, function() {
      buttons.forEach(function(button) {
        button.click();
      });
    });
  });
}

function getScaleFactor(possibleScalings) {
  return browser.executeScript('return navigator.userAgent').then(function(userAgent) {
    var scaleFactor = 1;
    possibleScalings.forEach(function(entry) {
      if (userAgent.match(entry.userAgent)) {
        scaleFactor = entry.value;
      }
    });
    return scaleFactor;
  });
}

function applyScaleFactor(value, scaleFactor, method) {
  if (method === 'log2') {
    return value + Math.log2(scaleFactor);
  } else if (method === 'sqrt') {
    return value * Math.sqrt(scaleFactor);
  } else if (method === 'linear') {
    return value * scaleFactor;
  } else {
    return value;
  }
}