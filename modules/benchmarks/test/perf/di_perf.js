"use strict";
var benchpress = require('../../../../tools/benchpress/benchpress.js');

describe('ng2 di benchmark', function () {

  var URL = 'benchmarks/web/di/di_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log the stats for getByToken', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#getByToken'],
      logId: 'ng2.di.getByToken'
    });
  });

  it('should log the stats for getByKey', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#getByKey'],
      logId: 'ng2.di.getByKey'
    });
  });

  it('should log the stats for getChild', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#getChild'],
      logId: 'ng2.di.getChild'
    });
  });

  it('should log the stats for instantiate', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#instantiate'],
      logId: 'ng2.di.instantiate'
    });
  });

});

function runClickTimeBenchmark(config) {
  var buttons = config.buttons.map(function(selector) {
    return $(selector);
  });
  var timeParams = browser.params.timeBenchmark;
  benchpress.runTimeBenchmark({
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
