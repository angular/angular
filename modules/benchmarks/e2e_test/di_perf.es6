"use strict";
var benchpress = require('../../../tools/benchpress/index.js');

describe('ng2 di benchmark', function () {

  var URL = 'benchmarks/web/di/di_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log the stats for getByToken', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#getByToken'],
      logId: 'ng2.di.getByToken'
    });
  });

  it('should log the stats for getByKey', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#getByKey'],
      logId: 'ng2.di.getByKey'
    });
  });

  it('should log the stats for getChild', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#getChild'],
      logId: 'ng2.di.getChild'
    });
  });

  it('should log the stats for instantiate', function() {
    browser.get(URL);
    runClickBenchmark({
      buttons: ['#instantiate'],
      logId: 'ng2.di.instantiate'
    });
  });

});

function runClickBenchmark(config) {
  var buttons = config.buttons.map(function(selector) {
    return $(selector);
  });
  var timeParams = browser.params.benchmark;
  benchpress.runBenchmark({
    sampleSize: timeParams.sampleSize,
    targetCoefficientOfVariation: timeParams.targetCoefficientOfVariation,
    timeout: timeParams.timeout,
    metrics: timeParams.metrics,
    logId: browser.params.lang+'.'+config.logId
  }, function() {
    buttons.forEach(function(button) {
      button.click();
    });
  });
}
