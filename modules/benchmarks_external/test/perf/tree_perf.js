"use strict";
var benchpress = require('../../../../tools/benchpress/benchpress.js');

describe('ng1.x tree benchmark', function () {

  var URL = 'benchmarks_external/web/tree/tree_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log the stats', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#destroyDom', '#createDom'],
      logId: 'ng1.tree'
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
