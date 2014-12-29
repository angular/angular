"use strict";
var benchpress = require('../../../../tools/benchpress/benchpress.js');

describe('ng2 tree benchmark', function () {

  var URL = 'benchmarks/web/tree/tree_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log the ng stats', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#ng2DestroyDom', '#ng2CreateDom'],
      logId: 'ng2.tree'
    });
  });

  it('should log the baseline stats', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#baselineDestroyDom', '#baselineCreateDom'],
      logId: 'baseline.tree'
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
