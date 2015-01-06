"use strict";
var benchpress = require('../../../tools/benchpress/index.js');

describe('ng2 element injector benchmark', function () {

  var URL = 'benchmarks/web/element_injector/element_injector_benchmark.html';

  afterEach(benchpress.verifyNoBrowserErrors);

  it('should log the stats for instantiate', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#instantiate'],
      logId: 'ng2.elementInjector.instantiate'
    });
  });

  it('should log the stats for instantiateDirectives', function() {
    browser.get(URL);
    runClickTimeBenchmark({
      buttons: ['#instantiateDirectives'],
      logId: 'ng2.elementInjector.instantiateDirectives'
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
