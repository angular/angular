var testUtil = require('./e2e_util');
var benchpress = require('benchpress/benchpress');

module.exports = {
  runClickBenchmark: runClickBenchmark,
  runBenchmark: runBenchmark,
  verifyNoBrowserErrors: testUtil.verifyNoBrowserErrors
};

function runClickBenchmark(config) {
  var buttons = config.buttons.map(function(selector) {
    return $(selector);
  });
  config.work = function() {
    buttons.forEach(function(button) {
      button.click();
    });
  }
  return runBenchmark(config);
}

function runBenchmark(config) {
  return getScaleFactor(browser.params.benchmark.scaling).then(function(scaleFactor) {
    var description = {};
    var urlParams = [];
    var microIterations = config.microIterations || 0;
    var params = config.params || [];
    if (microIterations) {
      params = params.concat([{
        name: 'iterations', value: microIterations, scale: 'linear'
      }]);
    }
    params.forEach(function(param) {
      var name = param.name;
      var value = applyScaleFactor(param.value, scaleFactor, param.scale);
      urlParams.push(name + '=' + value);
      description[name] = value;
    });
    var url = encodeURI(config.url + '?' + urlParams.join('&'));
    browser.get(url);
    return benchpressRunner.sample({
      id: config.id,
      execute: config.work,
      prepare: config.prepare,
      microIterations: microIterations,
      bindings: [
        benchpress.bind(benchpress.Options.SAMPLE_DESCRIPTION).toValue(description)
      ]
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