"use strict";
var benchpress = require('../../../../tools/benchpress/benchpress.js');

describe('ng2 compiler benchmark', function () {

  var URL = 'benchmarks/web/compiler/compiler_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log withBindings stats', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#compileWithBindings'],
      logId: 'ng2.compile.withBindings'
    });
  });

  it('should log noBindings stats', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#compileNoBindings'],
      logId: 'ng2.compile.noBindings'
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
